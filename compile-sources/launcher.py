#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SA Map Studio - Launcher (executável único de distribuição).

Primeira execução: descompacta o pacote interno na pasta 'sa-map-studio' ao lado do .exe.
Execuções seguintes: compara o manifesto do pacote (system/bundle.json) com o da pasta instalada.
Se for outro build, a pasta é atualizada para ficar exatamente igual ao pacote novo, sem perder os
dados do usuário, e o editor abre. Só um editor fica aberto por vez.

Como a atualização funciona:
- system e test-server são só do programa: são trocados inteiros, então o que não existe mais na
  versão nova some e o que é novo aparece;
- no resto da pasta (data, projects, exported) só os arquivos do pacote são mexidos: os do pacote novo
  são gravados e os que vieram no pacote anterior e não vêm neste são apagados. O que o usuário criou
  (projetos, exportados, config.json, logs, perfil da janela, miniaturas geradas) fica como está;
- o pacote novo é descompactado primeiro numa pasta à parte e conferido. A troca é feita com um
  diário (.sa-map-studio-update.json) e uma cópia de segurança do que sai: se der erro, faltar
  energia ou o Windows travar no meio, a próxima abertura desfaz o que ficou pela metade e a pasta
  volta a ser exatamente a anterior;
- antes de mexer em qualquer coisa, o editor e o servidor de testes precisam estar fechados.
"""

import os
import sys
import json
import time
import shutil
import zipfile
import threading
import subprocess

IS_WINDOWS = os.name == "nt"

ROOT_NAME = "sa-map-studio"
MANIFEST_REL = "system/bundle.json"
PROGRAM_DIRS = ("system", "test-server")      # replaced whole on update
USER_DIRS = ("projects", "exported", "data")  # nunca apagadas
STAGING_NAME = ".sa-map-studio-update"
BACKUP_NAME = ".sa-map-studio-backup"
JOURNAL_NAME = ".sa-map-studio-update.json"
EDITOR_MUTEX = "Local\\SAMapStudio.Editor"      # created by the editor (serve.py)
LAUNCHER_MUTEX = "Local\\SAMapStudio.Launcher"  # one launcher at a time
WINDOW_TITLE = "SA Map Studio"
ENGINE_EXE = "sa-map-studio.exe"


def dir_writable(path):
    """Testa se dá para gravar na pasta (em Arquivos de Programas, sem administrador, não dá)."""
    try:
        os.makedirs(path, exist_ok=True)
        probe = os.path.join(path, ".write-test-%d" % os.getpid())
        with open(probe, "w") as f:
            f.write("ok")
        os.remove(probe)
        return True
    except OSError:
        return False


def relaunch_as_admin():
    """Abre o próprio executável de novo pedindo administrador (UAC). True se o Windows aceitou."""
    if not IS_WINDOWS:
        return False
    try:
        import ctypes
        if ctypes.windll.shell32.IsUserAnAdmin():
            return False
        params = subprocess.list2cmdline(sys.argv[1:])
        r = ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, params, os.path.dirname(sys.executable), 1)
        return int(r) > 32
    except Exception:
        return False


def get_base_paths():
    if getattr(sys, "frozen", False):
        exe_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
        res_dir = getattr(sys, "_MEIPASS", exe_dir)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
        res_dir = exe_dir

    target_dir = os.path.join(exe_dir, ROOT_NAME)
    target_exe = os.path.join(target_dir, "system", ENGINE_EXE)
    return exe_dir, res_dir, target_dir, target_exe


# Launcher texts in all the editor's languages. It runs before the folder exists, so the texts
# live here and not in js/lang/*.json. New language: add a block with the code and all the keys.
TEXTS = {
    "en": {
        "open": "SA Map Studio is already open.",
        "cant_delete": "Could not delete {0}",
        "incomplete": "The package is incomplete ({0}).",
        "extracting": "Extracting: {0}",
        "installing": "Installing files",
        "done": "Done! Opening the editor",
        "t_install": "Installation",
        "t_update": "Update",
        "t_incompatible": "Incompatible version",
        "t_error": "Error",
        "t_install_error": "Installation error",
        "close_editor": "To update SA Map Studio to version {0}, close the open editor and the test server, if it is running. Save your project before closing.\n\nOpen now: {1}\n\nAfter closing, click Retry.",
        "no_bundle": "The SA Map Studio resource package was not found in the executable.",
        "recover_fail": "Could not finish the previous update:\n{0}\n\nClose the editor and the test server and open it again.",
        "older_exe": "This executable is SA Map Studio version {0}, but this folder already has version {1}, which is newer.\n\nAn old version does not open in a folder of a newer version, so your projects and settings are not damaged. Use the executable of version {1} or newer.",
        "disk_update": "Not enough disk space to update SA Map Studio: {0} MB free are needed.",
        "disk_install": "Not enough disk space to install SA Map Studio: {0} MB free are needed.",
        "updating_to": "Updating to version {0}",
        "first_run": "Preparing the editor for the first time",
        "update_fail": "Could not update SA Map Studio:\n{0}\n\nNothing was changed: the editor will open in the version that was already installed.",
        "install_fail": "Could not prepare SA Map Studio:\n{0}",
    },
    "es": {
        "open": "SA Map Studio ya está abierto.",
        "cant_delete": "No se pudo eliminar {0}",
        "incomplete": "El paquete está incompleto ({0}).",
        "extracting": "Extrayendo: {0}",
        "installing": "Instalando archivos",
        "done": "¡Listo! Abriendo el editor",
        "t_install": "Instalación",
        "t_update": "Actualización",
        "t_incompatible": "Versión incompatible",
        "t_error": "Error",
        "t_install_error": "Error de instalación",
        "close_editor": "Para actualizar SA Map Studio a la versión {0}, cierra el editor abierto y el servidor de pruebas, si está en ejecución. Guarda tu proyecto antes de cerrar.\n\nAbiertos ahora: {1}\n\nDespués de cerrar, haz clic en Reintentar.",
        "no_bundle": "No se encontró el paquete de recursos de SA Map Studio en el ejecutable.",
        "recover_fail": "No se pudo terminar la actualización anterior:\n{0}\n\nCierra el editor y el servidor de pruebas y vuelve a abrirlo.",
        "older_exe": "Este ejecutable es la versión {0} de SA Map Studio, pero esta carpeta ya tiene la versión {1}, que es más nueva.\n\nUna versión antigua no se abre en una carpeta de una versión más nueva, para no dañar tus proyectos y ajustes. Usa el ejecutable de la versión {1} o más nueva.",
        "disk_update": "No hay espacio en disco para actualizar SA Map Studio: se necesitan {0} MB libres.",
        "disk_install": "No hay espacio en disco para instalar SA Map Studio: se necesitan {0} MB libres.",
        "updating_to": "Actualizando a la versión {0}",
        "first_run": "Preparando el editor por primera vez",
        "update_fail": "No se pudo actualizar SA Map Studio:\n{0}\n\nNo se cambió nada: el editor se abrirá en la versión que ya estaba instalada.",
        "install_fail": "No se pudo preparar SA Map Studio:\n{0}",
    },
    "pt": {
        "open": "O SA Map Studio já está aberto.",
        "cant_delete": "Não foi possível apagar {0}",
        "incomplete": "O pacote está incompleto ({0}).",
        "extracting": "Extraindo: {0}",
        "installing": "Instalando arquivos",
        "done": "Concluído! Abrindo o editor",
        "t_install": "Instalação",
        "t_update": "Atualização",
        "t_incompatible": "Versão incompatível",
        "t_error": "Erro",
        "t_install_error": "Erro na instalação",
        "close_editor": "Para atualizar o SA Map Studio para a versão {0}, feche o editor que está aberto e o servidor de testes, se estiver rodando. Salve o seu projeto antes de fechar.\n\nAbertos agora: {1}\n\nDepois de fechar, clique em Tentar novamente.",
        "no_bundle": "O pacote de recursos do SA Map Studio não foi encontrado no executável.",
        "recover_fail": "Não foi possível terminar a atualização anterior:\n{0}\n\nFeche o editor e o servidor de testes e abra de novo.",
        "older_exe": "Este executável é a versão {0} do SA Map Studio, mas esta pasta já está com a versão {1}, que é mais nova.\n\nUma versão antiga não abre numa pasta de versão mais nova, para não estragar os seus projetos e configurações. Use o executável da versão {1} ou mais nova.",
        "disk_update": "Falta espaço em disco para atualizar o SA Map Studio: são necessários {0} MB livres.",
        "disk_install": "Falta espaço em disco para instalar o SA Map Studio: são necessários {0} MB livres.",
        "updating_to": "Atualizando para a versão {0}",
        "first_run": "Preparando o editor pela primeira vez",
        "update_fail": "Não foi possível atualizar o SA Map Studio:\n{0}\n\nNada foi alterado: o editor vai abrir na versão que já estava instalada.",
        "install_fail": "Não foi possível preparar o SA Map Studio:\n{0}",
    },
    "it": {
        "open": "SA Map Studio è già aperto.",
        "cant_delete": "Impossibile eliminare {0}",
        "incomplete": "Il pacchetto è incompleto ({0}).",
        "extracting": "Estrazione: {0}",
        "installing": "Installazione dei file",
        "done": "Fatto! Apertura dell'editor",
        "t_install": "Installazione",
        "t_update": "Aggiornamento",
        "t_incompatible": "Versione incompatibile",
        "t_error": "Errore",
        "t_install_error": "Errore di installazione",
        "close_editor": "Per aggiornare SA Map Studio alla versione {0}, chiudi l'editor aperto e il server di prova, se è in esecuzione. Salva il progetto prima di chiudere.\n\nAperti ora: {1}\n\nDopo averli chiusi, fai clic su Riprova.",
        "no_bundle": "Il pacchetto di risorse di SA Map Studio non è stato trovato nell'eseguibile.",
        "recover_fail": "Impossibile completare l'aggiornamento precedente:\n{0}\n\nChiudi l'editor e il server di prova e riaprilo.",
        "older_exe": "Questo eseguibile è la versione {0} di SA Map Studio, ma questa cartella ha già la versione {1}, più recente.\n\nUna versione vecchia non si apre in una cartella di una versione più recente, per non danneggiare progetti e impostazioni. Usa l'eseguibile della versione {1} o più recente.",
        "disk_update": "Spazio su disco insufficiente per aggiornare SA Map Studio: servono {0} MB liberi.",
        "disk_install": "Spazio su disco insufficiente per installare SA Map Studio: servono {0} MB liberi.",
        "updating_to": "Aggiornamento alla versione {0}",
        "first_run": "Preparazione dell'editor per la prima volta",
        "update_fail": "Impossibile aggiornare SA Map Studio:\n{0}\n\nNon è stato modificato nulla: l'editor si aprirà nella versione già installata.",
        "install_fail": "Impossibile preparare SA Map Studio:\n{0}",
    },
    "fr": {
        "open": "SA Map Studio est déjà ouvert.",
        "cant_delete": "Impossible de supprimer {0}",
        "incomplete": "Le paquet est incomplet ({0}).",
        "extracting": "Extraction : {0}",
        "installing": "Installation des fichiers",
        "done": "Terminé ! Ouverture de l'éditeur",
        "t_install": "Installation",
        "t_update": "Mise à jour",
        "t_incompatible": "Version incompatible",
        "t_error": "Erreur",
        "t_install_error": "Erreur d'installation",
        "close_editor": "Pour mettre à jour SA Map Studio vers la version {0}, fermez l'éditeur ouvert et le serveur de test s'il est lancé. Enregistrez votre projet avant de fermer.\n\nOuverts : {1}\n\nAprès la fermeture, cliquez sur Réessayer.",
        "no_bundle": "Le paquet de ressources de SA Map Studio est introuvable dans l'exécutable.",
        "recover_fail": "Impossible de terminer la mise à jour précédente :\n{0}\n\nFermez l'éditeur et le serveur de test puis rouvrez-le.",
        "older_exe": "Cet exécutable est la version {0} de SA Map Studio, mais ce dossier contient déjà la version {1}, plus récente.\n\nUne ancienne version ne s'ouvre pas dans le dossier d'une version plus récente, pour ne pas abîmer vos projets et réglages. Utilisez l'exécutable de la version {1} ou plus récente.",
        "disk_update": "Espace disque insuffisant pour mettre à jour SA Map Studio : {0} Mo libres requis.",
        "disk_install": "Espace disque insuffisant pour installer SA Map Studio : {0} Mo libres requis.",
        "updating_to": "Mise à jour vers la version {0}",
        "first_run": "Préparation de l'éditeur pour la première fois",
        "update_fail": "Impossible de mettre à jour SA Map Studio :\n{0}\n\nRien n'a été modifié : l'éditeur s'ouvrira dans la version déjà installée.",
        "install_fail": "Impossible de préparer SA Map Studio :\n{0}",
    },
    "de": {
        "open": "SA Map Studio ist bereits geöffnet.",
        "cant_delete": "{0} konnte nicht gelöscht werden",
        "incomplete": "Das Paket ist unvollständig ({0}).",
        "extracting": "Entpacken: {0}",
        "installing": "Dateien werden installiert",
        "done": "Fertig! Der Editor wird geöffnet",
        "t_install": "Installation",
        "t_update": "Aktualisierung",
        "t_incompatible": "Inkompatible Version",
        "t_error": "Fehler",
        "t_install_error": "Installationsfehler",
        "close_editor": "Um SA Map Studio auf Version {0} zu aktualisieren, schließe den geöffneten Editor und den Testserver, falls er läuft. Speichere dein Projekt vor dem Schließen.\n\nJetzt geöffnet: {1}\n\nKlicke nach dem Schließen auf Wiederholen.",
        "no_bundle": "Das Ressourcenpaket von SA Map Studio wurde in der ausführbaren Datei nicht gefunden.",
        "recover_fail": "Die vorherige Aktualisierung konnte nicht abgeschlossen werden:\n{0}\n\nSchließe den Editor und den Testserver und öffne ihn erneut.",
        "older_exe": "Diese ausführbare Datei ist SA Map Studio Version {0}, aber dieser Ordner enthält bereits die neuere Version {1}.\n\nEine alte Version öffnet sich nicht in einem Ordner einer neueren Version, damit deine Projekte und Einstellungen nicht beschädigt werden. Verwende die ausführbare Datei der Version {1} oder neuer.",
        "disk_update": "Nicht genug Speicherplatz, um SA Map Studio zu aktualisieren: {0} MB frei werden benötigt.",
        "disk_install": "Nicht genug Speicherplatz, um SA Map Studio zu installieren: {0} MB frei werden benötigt.",
        "updating_to": "Aktualisierung auf Version {0}",
        "first_run": "Der Editor wird zum ersten Mal vorbereitet",
        "update_fail": "SA Map Studio konnte nicht aktualisiert werden:\n{0}\n\nEs wurde nichts geändert: Der Editor öffnet sich in der bereits installierten Version.",
        "install_fail": "SA Map Studio konnte nicht vorbereitet werden:\n{0}",
    },
    "pl": {
        "open": "SA Map Studio jest już otwarty.",
        "cant_delete": "Nie udało się usunąć {0}",
        "incomplete": "Pakiet jest niekompletny ({0}).",
        "extracting": "Rozpakowywanie: {0}",
        "installing": "Instalowanie plików",
        "done": "Gotowe! Otwieranie edytora",
        "t_install": "Instalacja",
        "t_update": "Aktualizacja",
        "t_incompatible": "Niezgodna wersja",
        "t_error": "Błąd",
        "t_install_error": "Błąd instalacji",
        "close_editor": "Aby zaktualizować SA Map Studio do wersji {0}, zamknij otwarty edytor i serwer testowy, jeśli działa. Zapisz projekt przed zamknięciem.\n\nOtwarte teraz: {1}\n\nPo zamknięciu kliknij Ponów próbę.",
        "no_bundle": "Nie znaleziono pakietu zasobów SA Map Studio w pliku wykonywalnym.",
        "recover_fail": "Nie udało się dokończyć poprzedniej aktualizacji:\n{0}\n\nZamknij edytor i serwer testowy, a potem otwórz go ponownie.",
        "older_exe": "Ten plik wykonywalny to SA Map Studio w wersji {0}, ale ten folder ma już nowszą wersję {1}.\n\nStara wersja nie otwiera się w folderze nowszej wersji, dzięki czemu twoje projekty i ustawienia nie zostaną uszkodzone. Użyj pliku wykonywalnego w wersji {1} lub nowszej.",
        "disk_update": "Za mało miejsca na dysku, aby zaktualizować SA Map Studio: potrzeba {0} MB wolnego miejsca.",
        "disk_install": "Za mało miejsca na dysku, aby zainstalować SA Map Studio: potrzeba {0} MB wolnego miejsca.",
        "updating_to": "Aktualizacja do wersji {0}",
        "first_run": "Przygotowywanie edytora po raz pierwszy",
        "update_fail": "Nie udało się zaktualizować SA Map Studio:\n{0}\n\nNic nie zostało zmienione: edytor otworzy się w już zainstalowanej wersji.",
        "install_fail": "Nie udało się przygotować SA Map Studio:\n{0}",
    },
    "ro": {
        "open": "SA Map Studio este deja deschis.",
        "cant_delete": "Nu s-a putut șterge {0}",
        "incomplete": "Pachetul este incomplet ({0}).",
        "extracting": "Se extrage: {0}",
        "installing": "Se instalează fișierele",
        "done": "Gata! Se deschide editorul",
        "t_install": "Instalare",
        "t_update": "Actualizare",
        "t_incompatible": "Versiune incompatibilă",
        "t_error": "Eroare",
        "t_install_error": "Eroare la instalare",
        "close_editor": "Pentru a actualiza SA Map Studio la versiunea {0}, închide editorul deschis și serverul de test, dacă rulează. Salvează proiectul înainte de a închide.\n\nDeschise acum: {1}\n\nDupă închidere, fă clic pe Reîncercare.",
        "no_bundle": "Pachetul de resurse SA Map Studio nu a fost găsit în executabil.",
        "recover_fail": "Nu s-a putut finaliza actualizarea anterioară:\n{0}\n\nÎnchide editorul și serverul de test și deschide-l din nou.",
        "older_exe": "Acest executabil este versiunea {0} a SA Map Studio, dar acest folder are deja versiunea {1}, mai nouă.\n\nO versiune veche nu se deschide într-un folder al unei versiuni mai noi, ca proiectele și setările tale să nu fie stricate. Folosește executabilul versiunii {1} sau mai noi.",
        "disk_update": "Spațiu insuficient pe disc pentru a actualiza SA Map Studio: sunt necesari {0} MB liberi.",
        "disk_install": "Spațiu insuficient pe disc pentru a instala SA Map Studio: sunt necesari {0} MB liberi.",
        "updating_to": "Actualizare la versiunea {0}",
        "first_run": "Se pregătește editorul pentru prima dată",
        "update_fail": "Nu s-a putut actualiza SA Map Studio:\n{0}\n\nNu s-a schimbat nimic: editorul se va deschide în versiunea deja instalată.",
        "install_fail": "Nu s-a putut pregăti SA Map Studio:\n{0}",
    },
    "hu": {
        "open": "A SA Map Studio már meg van nyitva.",
        "cant_delete": "Nem sikerült törölni: {0}",
        "incomplete": "A csomag hiányos ({0}).",
        "extracting": "Kicsomagolás: {0}",
        "installing": "Fájlok telepítése",
        "done": "Kész! A szerkesztő megnyitása",
        "t_install": "Telepítés",
        "t_update": "Frissítés",
        "t_incompatible": "Nem kompatibilis verzió",
        "t_error": "Hiba",
        "t_install_error": "Telepítési hiba",
        "close_editor": "A SA Map Studio {0} verzióra frissítéséhez zárd be a megnyitott szerkesztőt és a tesztszervert, ha fut. Bezárás előtt mentsd a projektet.\n\nMost megnyitva: {1}\n\nBezárás után kattints az Újra gombra.",
        "no_bundle": "A SA Map Studio erőforráscsomagja nem található a futtatható fájlban.",
        "recover_fail": "Nem sikerült befejezni az előző frissítést:\n{0}\n\nZárd be a szerkesztőt és a tesztszervert, majd nyisd meg újra.",
        "older_exe": "Ez a futtatható fájl a SA Map Studio {0} verziója, de ebben a mappában már az újabb {1} verzió van.\n\nEgy régi verzió nem nyílik meg egy újabb verzió mappájában, így a projektjeid és beállításaid nem sérülnek. Használd a {1} vagy újabb verzió futtatható fájlját.",
        "disk_update": "Nincs elég lemezterület a SA Map Studio frissítéséhez: {0} MB szabad hely szükséges.",
        "disk_install": "Nincs elég lemezterület a SA Map Studio telepítéséhez: {0} MB szabad hely szükséges.",
        "updating_to": "Frissítés a(z) {0} verzióra",
        "first_run": "A szerkesztő első előkészítése",
        "update_fail": "Nem sikerült frissíteni a SA Map Studioót:\n{0}\n\nSemmi sem változott: a szerkesztő a már telepített verzióban nyílik meg.",
        "install_fail": "Nem sikerült előkészíteni a SA Map Studioót:\n{0}",
    },
    "tr": {
        "open": "SA Map Studio zaten açık.",
        "cant_delete": "{0} silinemedi",
        "incomplete": "Paket eksik ({0}).",
        "extracting": "Çıkarılıyor: {0}",
        "installing": "Dosyalar yükleniyor",
        "done": "Tamam! Editör açılıyor",
        "t_install": "Kurulum",
        "t_update": "Güncelleme",
        "t_incompatible": "Uyumsuz sürüm",
        "t_error": "Hata",
        "t_install_error": "Kurulum hatası",
        "close_editor": "SA Map Studio'yu {0} sürümüne güncellemek için açık editörü ve çalışıyorsa test sunucusunu kapat. Kapatmadan önce projeni kaydet.\n\nŞu an açık: {1}\n\nKapattıktan sonra Yeniden dene'ye tıkla.",
        "no_bundle": "SA Map Studio kaynak paketi çalıştırılabilir dosyada bulunamadı.",
        "recover_fail": "Önceki güncelleme tamamlanamadı:\n{0}\n\nEditörü ve test sunucusunu kapatıp yeniden aç.",
        "older_exe": "Bu çalıştırılabilir dosya SA Map Studio {0} sürümü, ancak bu klasörde zaten daha yeni olan {1} sürümü var.\n\nEski bir sürüm daha yeni bir sürümün klasöründe açılmaz; böylece projelerin ve ayarların bozulmaz. {1} veya daha yeni sürümün çalıştırılabilir dosyasını kullan.",
        "disk_update": "SA Map Studio'yu güncellemek için yeterli disk alanı yok: {0} MB boş alan gerekiyor.",
        "disk_install": "SA Map Studio'yu kurmak için yeterli disk alanı yok: {0} MB boş alan gerekiyor.",
        "updating_to": "{0} sürümüne güncelleniyor",
        "first_run": "Editör ilk kez hazırlanıyor",
        "update_fail": "SA Map Studio güncellenemedi:\n{0}\n\nHiçbir şey değiştirilmedi: editör zaten kurulu olan sürümde açılacak.",
        "install_fail": "SA Map Studio hazırlanamadı:\n{0}",
    },
    "id": {
        "open": "SA Map Studio sudah terbuka.",
        "cant_delete": "Tidak bisa menghapus {0}",
        "incomplete": "Paket tidak lengkap ({0}).",
        "extracting": "Mengekstrak: {0}",
        "installing": "Memasang file",
        "done": "Selesai! Membuka editor",
        "t_install": "Instalasi",
        "t_update": "Pembaruan",
        "t_incompatible": "Versi tidak kompatibel",
        "t_error": "Kesalahan",
        "t_install_error": "Kesalahan instalasi",
        "close_editor": "Untuk memperbarui SA Map Studio ke versi {0}, tutup editor yang terbuka dan server uji jika sedang berjalan. Simpan proyek kamu sebelum menutup.\n\nTerbuka sekarang: {1}\n\nSetelah menutup, klik Coba lagi.",
        "no_bundle": "Paket sumber daya SA Map Studio tidak ditemukan di file eksekusi.",
        "recover_fail": "Tidak bisa menyelesaikan pembaruan sebelumnya:\n{0}\n\nTutup editor dan server uji, lalu buka lagi.",
        "older_exe": "File eksekusi ini adalah SA Map Studio versi {0}, tetapi folder ini sudah berisi versi {1} yang lebih baru.\n\nVersi lama tidak dibuka di folder versi yang lebih baru, agar proyek dan pengaturan kamu tidak rusak. Gunakan file eksekusi versi {1} atau yang lebih baru.",
        "disk_update": "Ruang disk tidak cukup untuk memperbarui SA Map Studio: diperlukan {0} MB kosong.",
        "disk_install": "Ruang disk tidak cukup untuk memasang SA Map Studio: diperlukan {0} MB kosong.",
        "updating_to": "Memperbarui ke versi {0}",
        "first_run": "Menyiapkan editor untuk pertama kali",
        "update_fail": "Tidak bisa memperbarui SA Map Studio:\n{0}\n\nTidak ada yang diubah: editor akan dibuka dengan versi yang sudah terpasang.",
        "install_fail": "Tidak bisa menyiapkan SA Map Studio:\n{0}",
    },
    "vi": {
        "open": "SA Map Studio đã được mở.",
        "cant_delete": "Không thể xóa {0}",
        "incomplete": "Gói không đầy đủ ({0}).",
        "extracting": "Đang giải nén: {0}",
        "installing": "Đang cài đặt tệp",
        "done": "Xong! Đang mở trình chỉnh sửa",
        "t_install": "Cài đặt",
        "t_update": "Cập nhật",
        "t_incompatible": "Phiên bản không tương thích",
        "t_error": "Lỗi",
        "t_install_error": "Lỗi cài đặt",
        "close_editor": "Để cập nhật SA Map Studio lên phiên bản {0}, hãy đóng trình chỉnh sửa đang mở và máy chủ thử nghiệm nếu nó đang chạy. Lưu dự án trước khi đóng.\n\nĐang mở: {1}\n\nSau khi đóng, nhấp Thử lại.",
        "no_bundle": "Không tìm thấy gói tài nguyên của SA Map Studio trong tệp thực thi.",
        "recover_fail": "Không thể hoàn tất lần cập nhật trước:\n{0}\n\nHãy đóng trình chỉnh sửa và máy chủ thử nghiệm rồi mở lại.",
        "older_exe": "Tệp thực thi này là SA Map Studio phiên bản {0}, nhưng thư mục này đã có phiên bản {1} mới hơn.\n\nPhiên bản cũ không mở trong thư mục của phiên bản mới hơn, để dự án và cài đặt của bạn không bị hỏng. Hãy dùng tệp thực thi phiên bản {1} hoặc mới hơn.",
        "disk_update": "Không đủ dung lượng đĩa để cập nhật SA Map Studio: cần {0} MB trống.",
        "disk_install": "Không đủ dung lượng đĩa để cài đặt SA Map Studio: cần {0} MB trống.",
        "updating_to": "Đang cập nhật lên phiên bản {0}",
        "first_run": "Đang chuẩn bị trình chỉnh sửa lần đầu",
        "update_fail": "Không thể cập nhật SA Map Studio:\n{0}\n\nKhông có gì bị thay đổi: trình chỉnh sửa sẽ mở bằng phiên bản đã cài.",
        "install_fail": "Không thể chuẩn bị SA Map Studio:\n{0}",
    },
    "ru": {
        "open": "SA Map Studio уже открыт.",
        "cant_delete": "Не удалось удалить {0}",
        "incomplete": "Пакет неполный ({0}).",
        "extracting": "Распаковка: {0}",
        "installing": "Установка файлов",
        "done": "Готово! Открываем редактор",
        "t_install": "Установка",
        "t_update": "Обновление",
        "t_incompatible": "Несовместимая версия",
        "t_error": "Ошибка",
        "t_install_error": "Ошибка установки",
        "close_editor": "Чтобы обновить SA Map Studio до версии {0}, закройте открытый редактор и тестовый сервер, если он запущен. Сохраните проект перед закрытием.\n\nСейчас открыто: {1}\n\nПосле закрытия нажмите «Повторить».",
        "no_bundle": "Пакет ресурсов SA Map Studio не найден в исполняемом файле.",
        "recover_fail": "Не удалось завершить предыдущее обновление:\n{0}\n\nЗакройте редактор и тестовый сервер и откройте его снова.",
        "older_exe": "Этот исполняемый файл — SA Map Studio версии {0}, но в этой папке уже есть более новая версия {1}.\n\nСтарая версия не открывается в папке более новой версии, чтобы ваши проекты и настройки не пострадали. Используйте исполняемый файл версии {1} или новее.",
        "disk_update": "Недостаточно места на диске для обновления SA Map Studio: нужно {0} МБ свободного места.",
        "disk_install": "Недостаточно места на диске для установки SA Map Studio: нужно {0} МБ свободного места.",
        "updating_to": "Обновление до версии {0}",
        "first_run": "Первая подготовка редактора",
        "update_fail": "Не удалось обновить SA Map Studio:\n{0}\n\nНичего не изменено: редактор откроется в уже установленной версии.",
        "install_fail": "Не удалось подготовить SA Map Studio:\n{0}",
    },
    "uk": {
        "open": "SA Map Studio уже відкрито.",
        "cant_delete": "Не вдалося видалити {0}",
        "incomplete": "Пакет неповний ({0}).",
        "extracting": "Розпакування: {0}",
        "installing": "Встановлення файлів",
        "done": "Готово! Відкриваємо редактор",
        "t_install": "Встановлення",
        "t_update": "Оновлення",
        "t_incompatible": "Несумісна версія",
        "t_error": "Помилка",
        "t_install_error": "Помилка встановлення",
        "close_editor": "Щоб оновити SA Map Studio до версії {0}, закрийте відкритий редактор і тестовий сервер, якщо він запущений. Збережіть проєкт перед закриттям.\n\nЗараз відкрито: {1}\n\nПісля закриття натисніть «Повторити».",
        "no_bundle": "Пакет ресурсів SA Map Studio не знайдено у виконуваному файлі.",
        "recover_fail": "Не вдалося завершити попереднє оновлення:\n{0}\n\nЗакрийте редактор і тестовий сервер і відкрийте його знову.",
        "older_exe": "Цей виконуваний файл — SA Map Studio версії {0}, але в цій папці вже є новіша версія {1}.\n\nСтара версія не відкривається в папці новішої версії, щоб ваші проєкти й налаштування не постраждали. Використовуйте виконуваний файл версії {1} або новішої.",
        "disk_update": "Недостатньо місця на диску для оновлення SA Map Studio: потрібно {0} МБ вільного місця.",
        "disk_install": "Недостатньо місця на диску для встановлення SA Map Studio: потрібно {0} МБ вільного місця.",
        "updating_to": "Оновлення до версії {0}",
        "first_run": "Перша підготовка редактора",
        "update_fail": "Не вдалося оновити SA Map Studio:\n{0}\n\nНічого не змінено: редактор відкриється у вже встановленій версії.",
        "install_fail": "Не вдалося підготувати SA Map Studio:\n{0}",
    },
    "bg": {
        "open": "SA Map Studio вече е отворен.",
        "cant_delete": "Не успях да изтрия {0}",
        "incomplete": "Пакетът е непълен ({0}).",
        "extracting": "Разархивиране: {0}",
        "installing": "Инсталиране на файловете",
        "done": "Готово! Отваряне на редактора",
        "t_install": "Инсталиране",
        "t_update": "Обновяване",
        "t_incompatible": "Несъвместима версия",
        "t_error": "Грешка",
        "t_install_error": "Грешка при инсталиране",
        "close_editor": "За да обновите SA Map Studio до версия {0}, затворете отворения редактор и тестовия сървър, ако работи. Запазете проекта си преди затваряне.\n\nОтворени сега: {1}\n\nСлед затваряне щракнете върху Нов опит.",
        "no_bundle": "Пакетът с ресурси на SA Map Studio не е намерен в изпълнимия файл.",
        "recover_fail": "Не успях да завърша предишното обновяване:\n{0}\n\nЗатворете редактора и тестовия сървър и го отворете отново.",
        "older_exe": "Този изпълним файл е SA Map Studio версия {0}, но в тази папка вече има по-новата версия {1}.\n\nСтара версия не се отваря в папка на по-нова версия, за да не се повредят проектите и настройките ви. Използвайте изпълнимия файл на версия {1} или по-нова.",
        "disk_update": "Няма достатъчно място на диска за обновяване на SA Map Studio: нужни са {0} MB свободно място.",
        "disk_install": "Няма достатъчно място на диска за инсталиране на SA Map Studio: нужни са {0} MB свободно място.",
        "updating_to": "Обновяване до версия {0}",
        "first_run": "Първоначална подготовка на редактора",
        "update_fail": "Не успях да обновя SA Map Studio:\n{0}\n\nНищо не е променено: редакторът ще се отвори в вече инсталираната версия.",
        "install_fail": "Не успях да подготвя SA Map Studio:\n{0}",
    },
}
LANGS = tuple(TEXTS)
# Windows primary language (GetUserDefaultUILanguage & 0x3FF) to the editor's code
WINDOWS_LANGS = {0x09: "en", 0x0A: "es", 0x16: "pt", 0x10: "it", 0x0C: "fr", 0x07: "de", 0x15: "pl", 0x18: "ro",
                 0x0E: "hu", 0x1F: "tr", 0x21: "id", 0x2A: "vi", 0x19: "ru", 0x22: "uk", 0x02: "bg"}
_lang_cache = []


def ui_lang():
    """Idioma escolhido no editor (data/config.json); sem escolha, o do Windows; senão inglês."""
    if not _lang_cache:
        code = ""
        try:
            with open(os.path.join(get_base_paths()[2], "data", "config.json"), encoding="utf-8") as f:
                code = str(json.load(f).get("language") or "")
        except Exception:
            pass
        if code not in LANGS and os.name == "nt":
            try:
                import ctypes
                code = WINDOWS_LANGS.get(ctypes.windll.kernel32.GetUserDefaultUILanguage() & 0x3FF, "")
            except Exception:
                code = ""
        _lang_cache.append(code if code in LANGS else "en")
    return _lang_cache[0]


def tr(key, *args):
    return TEXTS[ui_lang()][key].format(*args)


# ---------------------------------------------------------------------------- Windows: instances

_held_mutexes = []


def acquire_mutex(name):
    """Cria o mutex com nome e o mantém até o processo acabar. False se outro processo já tem."""
    if not IS_WINDOWS:
        return True
    try:
        import ctypes
        k = ctypes.windll.kernel32
        k.CreateMutexW.restype = ctypes.c_void_p
        h = k.CreateMutexW(None, False, name)
        already = k.GetLastError() == 183  # ERROR_ALREADY_EXISTS
        if h and already:
            k.CloseHandle(ctypes.c_void_p(h))
        elif h:
            _held_mutexes.append(h)
        return not already
    except Exception:
        return True


def mutex_exists(name):
    if not IS_WINDOWS:
        return False
    try:
        import ctypes
        k = ctypes.windll.kernel32
        k.OpenMutexW.restype = ctypes.c_void_p
        h = k.OpenMutexW(0x00100000, False, name)  # SYNCHRONIZE
        if h:
            k.CloseHandle(ctypes.c_void_p(h))
            return True
    except Exception:
        pass
    return False


def processes_in(folder):
    """Processos cujo executável está dentro da pasta (editor antigo, servidor de testes)."""
    if not IS_WINDOWS or not os.path.isdir(folder):
        return []
    out = []
    try:
        import ctypes
        from ctypes import wintypes
        k = ctypes.windll.kernel32
        psapi = ctypes.windll.psapi
        k.OpenProcess.restype = wintypes.HANDLE
        pids = (wintypes.DWORD * 8192)()
        needed = wintypes.DWORD()
        if not psapi.EnumProcesses(ctypes.byref(pids), ctypes.sizeof(pids), ctypes.byref(needed)):
            return []
        base = os.path.normcase(os.path.abspath(folder)).rstrip("\\/") + os.sep
        me = os.getpid()
        for pid in pids[:needed.value // ctypes.sizeof(wintypes.DWORD)]:
            if not pid or pid == me:
                continue
            h = k.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
            if not h:
                continue
            try:
                buf = ctypes.create_unicode_buffer(32768)
                size = wintypes.DWORD(32768)
                if k.QueryFullProcessImageNameW(h, 0, buf, ctypes.byref(size)):
                    if os.path.normcase(buf.value).startswith(base):
                        out.append(os.path.basename(buf.value))
            finally:
                k.CloseHandle(h)
    except Exception:
        pass
    return out


def editor_running(target_dir):
    """Editor aberto: o da versão atual tem o mutex; o de versões antigas é achado pelo processo."""
    return mutex_exists(EDITOR_MUTEX) or any(p.lower() == ENGINE_EXE for p in processes_in(target_dir))


def focus_editor():
    """Traz a janela do editor aberto para a frente. True se achou."""
    if not IS_WINDOWS:
        return False
    try:
        import ctypes
        u = ctypes.windll.user32
        hwnd = u.FindWindowW(None, WINDOW_TITLE)
        if not hwnd:
            return False
        if u.IsIconic(hwnd):
            u.ShowWindow(hwnd, 9)  # SW_RESTORE
        u.SetForegroundWindow(hwnd)
        return True
    except Exception:
        return False


# ---------------------------------------------------------------------------- mensagens

def _dialog(kind, title, text):
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        try:
            fn = {"info": messagebox.showinfo, "error": messagebox.showerror,
                  "retry": messagebox.askretrycancel, "yesno": messagebox.askyesno}[kind]
            return fn(title, text, parent=root)
        finally:
            root.destroy()
    except Exception:
        return kind == "info"


def show_already_open():
    if not focus_editor():
        _dialog("info", WINDOW_TITLE, tr("open"))


# ---------------------------------------------------------------------------- manifest and versions

def manifest_from_zip(bundle_zip):
    try:
        with zipfile.ZipFile(bundle_zip, "r") as z:
            return json.loads(z.read(ROOT_NAME + "/" + MANIFEST_REL).decode("utf-8"))
    except (KeyError, OSError, ValueError, zipfile.BadZipFile):
        return None


def manifest_installed(target_dir):
    try:
        with open(os.path.join(target_dir, *MANIFEST_REL.split("/")), "r", encoding="utf-8") as f:
            m = json.load(f)
        return m if isinstance(m.get("files"), list) else None
    except (OSError, ValueError, AttributeError):
        return None


def version_tuple(v):
    out = []
    for part in str(v or "0").split("."):
        digits = "".join(ch for ch in part if ch.isdigit())
        out.append(int(digits) if digits else 0)
    return tuple(out)


# ---------------------------------------------------------------------------- arquivos

def _native(base, rel):
    return os.path.join(base, *rel.split("/"))


def _retry(fn, *args):
    # Antivirus and indexing hold files for a moment: retries before giving up
    for attempt in range(40):
        try:
            return fn(*args)
        except PermissionError:
            if attempt == 39:
                raise
            time.sleep(0.25)


def _move(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    _retry(os.replace, src, dst)


def _remove(path):
    if os.path.isdir(path) and not os.path.islink(path):
        _rmtree(path)
    elif os.path.lexists(path):
        _retry(os.remove, path)


def _rmtree(path):
    if not os.path.lexists(path):
        return

    def onerror(func, p, _exc):
        try:
            os.chmod(p, 0o666)
            func(p)
        except OSError:
            pass
    for attempt in range(20):
        shutil.rmtree(path, onerror=onerror)
        if not os.path.lexists(path):
            return
        time.sleep(0.25)
    raise OSError(tr("cant_delete", path))


def _write_journal(exe_dir, data):
    path = os.path.join(exe_dir, JOURNAL_NAME)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f)
        f.flush()
        os.fsync(f.fileno())
    _retry(os.replace, tmp, path)


def _read_journal(exe_dir):
    try:
        with open(os.path.join(exe_dir, JOURNAL_NAME), "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


# Plan operations (each can be undone even if it stopped midway):
#   swapdir  program folder swapped: the old one goes to the backup copy and the new one comes in
#   adddir   program folder that did not exist
#   deldir   program folder that no longer exists
#   replace  package file that already existed
#   add      new package file
#   delete   file from the previous package that is not in this one
def _do(op, rel, target, staging, backup):
    t, s, b = _native(target, rel), _native(staging, rel), _native(backup, rel)
    if op in ("swapdir", "replace", "deldir", "delete") and os.path.lexists(t):
        _move(t, b)
    if op in ("swapdir", "adddir", "replace", "add"):
        _move(s, t)


def _undo(op, rel, target, backup):
    t, b = _native(target, rel), _native(backup, rel)
    if op in ("adddir", "add"):
        _remove(t)
    elif os.path.lexists(b):
        _remove(t)
        _move(b, t)


def _prune_empty(target, rels):
    # Folders left empty because the package no longer brings anything into them (never the user's folders)
    keep = {os.path.normcase(os.path.join(target, d)) for d in USER_DIRS} | {os.path.normcase(target)}
    for rel in rels:
        d = os.path.dirname(_native(target, rel))
        while os.path.normcase(d) not in keep and os.path.normcase(d).startswith(os.path.normcase(target)):
            try:
                os.rmdir(d)
            except OSError:
                break
            d = os.path.dirname(d)


def _cleanup(exe_dir, ops=None):
    target = os.path.join(exe_dir, ROOT_NAME)
    if ops:
        _prune_empty(target, [rel for op, rel in ops if op == "delete"])
    _rmtree(os.path.join(exe_dir, BACKUP_NAME))
    _rmtree(os.path.join(exe_dir, STAGING_NAME))
    if os.path.isdir(target):
        for d in USER_DIRS:
            os.makedirs(os.path.join(target, d), exist_ok=True)
    j = os.path.join(exe_dir, JOURNAL_NAME)
    if os.path.lexists(j):
        _retry(os.remove, j)


def recover(exe_dir):
    """Termina ou desfaz uma atualização que parou no meio (erro, queda de energia)."""
    j = _read_journal(exe_dir)
    if j and j.get("state") == "applying":
        target = os.path.join(exe_dir, ROOT_NAME)
        backup = os.path.join(exe_dir, BACKUP_NAME)
        for op, rel in reversed(j.get("ops", [])):
            _undo(op, rel, target, backup)
        _cleanup(exe_dir)
    elif j and j.get("state") == "done":
        _cleanup(exe_dir, j.get("ops"))
    else:
        # Extraction interrupted before touching the folder: only the temporary folder is left
        _rmtree(os.path.join(exe_dir, STAGING_NAME))
        _rmtree(os.path.join(exe_dir, BACKUP_NAME))


def install(bundle_zip, exe_dir, new_manifest, old_manifest, progress):
    """Deixa a pasta igual ao pacote, mantendo os dados do usuário. Em erro, volta tudo e repassa o erro."""
    target = os.path.join(exe_dir, ROOT_NAME)
    staging = os.path.join(exe_dir, STAGING_NAME)
    backup = os.path.join(exe_dir, BACKUP_NAME)
    _rmtree(staging)
    _rmtree(backup)

    # 1. Extracts separately (the installed folder has not been touched yet)
    with zipfile.ZipFile(bundle_zip, "r") as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
        total = max(1, len(infos))
        for idx, info in enumerate(infos, 1):
            z.extract(info, staging)
            if idx % 25 == 0 or idx == total:
                name = os.path.basename(info.filename)
                progress(idx / total * 80.0, tr("extracting", name if len(name) <= 35 else name[:32]))
    new_root = os.path.join(staging, ROOT_NAME)
    files = list(new_manifest.get("files") or [])
    missing = [f for f in files + [MANIFEST_REL] if not os.path.isfile(_native(new_root, f))]
    if missing:
        raise RuntimeError(tr("incomplete", missing[0]))

    # 2. Plano
    top = lambda rel: rel.split("/", 1)[0]
    ops = []
    for d in PROGRAM_DIRS:
        if os.path.isdir(os.path.join(new_root, d)):
            ops.append(["swapdir" if os.path.lexists(os.path.join(target, d)) else "adddir", d])
        elif os.path.lexists(os.path.join(target, d)):
            ops.append(["deldir", d])
    new_set = set(files)
    for f in files:
        if top(f) not in PROGRAM_DIRS:
            ops.append(["replace" if os.path.lexists(_native(target, f)) else "add", f])
    for f in (old_manifest or {}).get("files", []):
        if top(f) not in PROGRAM_DIRS and f not in new_set and os.path.isfile(_native(target, f)):
            ops.append(["delete", f])

    # 3. Applies with a journal; any error undoes everything
    _write_journal(exe_dir, {"state": "applying", "ops": ops})
    try:
        for n, (op, rel) in enumerate(ops, 1):
            _do(op, rel, target, new_root, backup)
            if n % 25 == 0 or n == len(ops):
                progress(80.0 + 20.0 * n / len(ops), tr("installing"))
        _write_journal(exe_dir, {"state": "done", "ops": ops})
    except BaseException:
        for op, rel in reversed(ops):
            try:
                _undo(op, rel, target, backup)
            except Exception:
                pass
        _cleanup(exe_dir)
        raise
    _cleanup(exe_dir, ops)


# ---------------------------------------------------------------------------- progress window

def run_with_progress(subtitle, exe_dir, work):
    """Mostra a janela de progresso enquanto work(progress) roda. Repassa o erro de work."""
    result = {"error": None}
    try:
        import tkinter as tk
        from tkinter import ttk
    except ImportError:
        work(lambda pct, text: None)
        return

    root = tk.Tk()
    root.title(WINDOW_TITLE + " - " + tr("t_install"))
    root.configure(bg="#1c2228")
    root.resizable(False, False)
    root.protocol("WM_DELETE_WINDOW", lambda: None)  # does not close midway

    frames = []
    for cand in (
        os.path.join(getattr(sys, "_MEIPASS", ""), "launcher_frames"),
        os.path.join(exe_dir, "launcher_frames"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "launcher_frames"),
    ):
        if os.path.isdir(cand):
            for i in range(50):
                fp = os.path.join(cand, f"frame_{i:02d}.png")
                if os.path.isfile(fp):
                    try:
                        frames.append(tk.PhotoImage(file=fp))
                    except Exception:
                        pass
            break

    w, h = 440, (295 if frames else 210)
    x = max(0, (root.winfo_screenwidth() - w) // 2)
    y = max(0, (root.winfo_screenheight() - h) // 2)
    root.geometry(f"{w}x{h}+{x}+{y}")
    for icocand in (
        os.path.join(getattr(sys, "_MEIPASS", ""), "icon.ico"),
        os.path.join(exe_dir, "icon.ico"),
        os.path.join(exe_dir, ROOT_NAME, "system", "icon.ico"),
    ):
        if os.path.isfile(icocand):
            try:
                root.iconbitmap(icocand)
                break
            except Exception:
                pass

    style = ttk.Style()
    try:
        style.theme_use("clam")
    except Exception:
        pass
    style.configure("Dark.Horizontal.TProgressbar", troughcolor="#2b333b", background="#f0a630",
                    bordercolor="#1c2228", lightcolor="#f0a630", darkcolor="#f0a630")

    icon_label = None
    if frames:
        icon_label = tk.Label(root, image=frames[0], bg="#1c2228")
        icon_label.pack(pady=(16, 6))
    tk.Label(root, text=WINDOW_TITLE, font=("Segoe UI", 15, "bold"), fg="#e6e2d8", bg="#1c2228").pack(
        pady=(0, 2) if frames else (22, 4))
    tk.Label(root, text=subtitle, font=("Segoe UI", 10), fg="#a8b1b8", bg="#1c2228").pack(pady=(0, 12))
    prog_var = tk.DoubleVar(value=0.0)
    ttk.Progressbar(root, variable=prog_var, maximum=100.0, style="Dark.Horizontal.TProgressbar", length=350).pack(pady=(0, 8))
    status_var = tk.StringVar(value="Iniciando")
    tk.Label(root, textvariable=status_var, font=("Segoe UI", 9), fg="#7d8892", bg="#1c2228").pack()

    def progress(pct, text):
        def apply():
            prog_var.set(pct)
            status_var.set(f"{text} ({int(pct)}%)")
            if icon_label is not None:
                icon_label.configure(image=frames[min(len(frames) - 1, int(pct / 100.0 * (len(frames) - 1)))])
        root.after(0, apply)

    def worker():
        try:
            work(progress)
            progress(100.0, tr("done"))
            time.sleep(0.4)
        except BaseException as e:  # noqa: B036 - passed on to the main thread
            result["error"] = e
        finally:
            root.after(0, root.destroy)

    threading.Thread(target=worker, daemon=True).start()
    root.mainloop()
    if result["error"] is not None:
        raise result["error"]


# ---------------------------------------------------------------------------- execution

def launch(target_exe, exe_dir):
    try:
        proc = subprocess.Popen([target_exe] + sys.argv[1:], cwd=exe_dir)
        try:
            proc.wait()
        except KeyboardInterrupt:
            proc.terminate()
            proc.wait()
        sys.exit(proc.returncode)
    except Exception:
        sys.exit(1)


def wait_until_closed(target_dir, version):
    """Pede para fechar o editor e o servidor de testes. False se o usuário cancelar."""
    while True:
        open_now = sorted(set(processes_in(target_dir)))
        if mutex_exists(EDITOR_MUTEX) and ENGINE_EXE not in [p.lower() for p in open_now]:
            open_now.insert(0, ENGINE_EXE)
        if not open_now:
            return True
        focus_editor()
        text = tr("close_editor", version, ", ".join(open_now))
        if not _dialog("retry", WINDOW_TITLE + " - " + tr("t_update"), text):
            return False


def main():
    if IS_WINDOWS:
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("samapstudio.pro")
        except Exception:
            pass

    exe_dir, res_dir, target_dir, target_exe = get_base_paths()

    # The editor writes everything to its own folder. In a protected folder (like GTA's in Program
    # Files) it reopens asking for administrator; in any other folder, it asks for nothing.
    if getattr(sys, "frozen", False) and not dir_writable(target_dir if os.path.isdir(target_dir) else exe_dir):
        if relaunch_as_admin():
            sys.exit(0)

    # Pacote embutido
    bundle_zip = None
    for cand in (
        os.path.join(res_dir, ROOT_NAME + ".zip"),
        os.path.join(exe_dir, ROOT_NAME + ".zip"),
        os.path.join(exe_dir, "build", ROOT_NAME + ".zip"),
    ):
        if os.path.isfile(cand):
            bundle_zip = cand
            break

    if not bundle_zip:
        if not getattr(sys, "frozen", False):
            print("Launcher em modo de desenvolvimento. Executando serve.py...")
            serve_script = os.path.join(exe_dir, "serve.py")
            proc = subprocess.Popen([sys.executable, serve_script] + sys.argv[1:], cwd=exe_dir)
            try:
                proc.wait()
            except KeyboardInterrupt:
                proc.terminate()
                proc.wait()
            sys.exit(proc.returncode)
        _dialog("error", tr("t_error"), tr("no_bundle"))
        sys.exit(1)

    # One launcher at a time: another one open means the editor is open (or installing)
    if not acquire_mutex(LAUNCHER_MUTEX):
        show_already_open()
        sys.exit(0)

    try:
        recover(exe_dir)
    except Exception as e:
        _dialog("error", WINDOW_TITLE, tr("recover_fail", e))
        sys.exit(1)

    new_manifest = manifest_from_zip(bundle_zip) or {"version": "0", "build": "", "files": None}
    old_manifest = manifest_installed(target_dir)
    installed = os.path.isfile(target_exe)
    need = (not installed or not old_manifest or not new_manifest.get("build")
            or old_manifest.get("build") != new_manifest.get("build"))

    # Old version in a newer version's folder: neither opens nor installs (projects and settings
    # saved by the new version may not work in the old one)
    if installed and old_manifest and version_tuple(new_manifest.get("version")) < version_tuple(old_manifest.get("version")):
        _dialog("error", WINDOW_TITLE + " - " + tr("t_incompatible"),
                tr("older_exe", new_manifest.get("version"), old_manifest.get("version")))
        sys.exit(1)

    if not need:
        if editor_running(target_dir):
            show_already_open()
            sys.exit(0)
        launch(target_exe, exe_dir)

    version = new_manifest.get("version") or ""
    if not wait_until_closed(target_dir, version):
        sys.exit(0)

    # Space: the package is fully extracted before the swap
    need_bytes = int((new_manifest.get("size") or 0) * 1.1) + 64 * 1024 * 1024
    try:
        free = shutil.disk_usage(exe_dir).free
    except OSError:
        free = need_bytes
    if free < need_bytes:
        _dialog("error", WINDOW_TITLE, tr("disk_update" if installed else "disk_install", need_bytes // (1024 * 1024)))
        if installed:
            launch(target_exe, exe_dir)
        sys.exit(1)

    files = new_manifest.get("files")
    subtitle = tr("updating_to", version) if installed else tr("first_run")
    try:
        if files is None:
            # Package without a manifest (should not happen): installs the old way, deleting nothing
            run_with_progress(subtitle, exe_dir, lambda progress: zipfile.ZipFile(bundle_zip).extractall(exe_dir))
        else:
            run_with_progress(subtitle, exe_dir, lambda progress: install(bundle_zip, exe_dir, new_manifest, old_manifest, progress))
    except Exception as e:
        if installed:
            _dialog("error", WINDOW_TITLE, tr("update_fail", e))
            launch(target_exe, exe_dir)
        _dialog("error", tr("t_install_error"), tr("install_fail", e))
        sys.exit(1)

    if not os.path.isfile(target_exe):
        sys.exit(1)
    launch(target_exe, exe_dir)


if __name__ == "__main__":
    main()
