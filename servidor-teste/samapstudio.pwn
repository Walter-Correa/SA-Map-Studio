// ===========================================================================
// SA Map Studio - gamemode de teste
// Lê o mapa de scriptfiles/samapstudio/mapa.txt (gerado pelo editor), cria os
// objetos, as trocas de textura e texto, remove os prédios e coloca o jogador
// no ponto escolhido. Usa só funções nativas do SA-MP/open.mp (sem plugins).
// ===========================================================================
#include <a_samp>

#define SAMS_ARQUIVO        "samapstudio/mapa.txt"
#define SAMS_MAX_OBJETOS    2000
#define SAMS_MAX_REMOVIDOS  1000
#define SAMS_MAX_VEICULOS   200
#define SAMS_MAX_ACTORS     500
#define SAMS_COR_INFO       0xF0A630FF
#define SAMS_COR_OK         0x57B77AFF

// Modo de voo livre (No-Clip)
#define CAMERA_MODE_NONE        0
#define CAMERA_MODE_FLY         1

#define MOVE_FORWARD            1
#define MOVE_BACK               2
#define MOVE_LEFT               3
#define MOVE_RIGHT              4
#define MOVE_FORWARD_LEFT       5
#define MOVE_FORWARD_RIGHT      6
#define MOVE_BACK_LEFT          7
#define MOVE_BACK_RIGHT         8

#define FLY_MOVE_SPEED          100.0
#define FLY_ACCEL_RATE          0.03

enum E_NOCLIP_DATA
{
    noclip_cameramode,
    noclip_flyobject,
    noclip_mode,
    noclip_lrold,
    noclip_udold,
    noclip_lastmove,
    Float:noclip_accelmul
}
new gNoClip[MAX_PLAYERS][E_NOCLIP_DATA];
new Float:gFlySavedPos[MAX_PLAYERS][4];
new gFlySavedInterior[MAX_PLAYERS];
new gFlySavedWorld[MAX_PLAYERS];
new bool:gReturningFromFly[MAX_PLAYERS];

new gObjetos[SAMS_MAX_OBJETOS];
new gTotalObjetos;
new Float:gRemovidos[SAMS_MAX_REMOVIDOS][4];
new gRemovidosModelo[SAMS_MAX_REMOVIDOS];
new gTotalRemovidos;
new gTotalVeiculos;
new gTotalActors;
new gActors[SAMS_MAX_ACTORS];

enum E_SAMS_ACTOR_ANIM
{
    bool:act_hasAnim,
    act_lib[32],
    act_name[32],
    Float:act_delta,
    bool:act_loop,
    bool:act_lockx,
    bool:act_locky,
    bool:act_freeze,
    act_time
}
new gActorAnim[SAMS_MAX_ACTORS][E_SAMS_ACTOR_ANIM];
new gAnimLibs[64][32];
new gTotalAnimLibs = 0;
new gIgnorados;
new Float:gSpawn[4];
new gSpawnInterior;
new gSpawnMundo;
new bool:gJetpack = true;

// Clima, Horário e Centro do Mapa
new gClima = 10;
new gHora = 10;
new gMinuto = 0;
new Float:gMapCenter[3] = {0.0, 0.0, 15.0};
new bool:gHasMapCenter = false;

main()
{
    print("SA Map Studio - teste de mapa");
}

// Copia o campo número "campo" (separado por |) da linha para "destino"
stock SAMS_Campo(const linha[], campo, destino[], tamanho)
{
    new atual = 0, i = 0, j = 0;
    destino[0] = EOS;
    while (linha[i] != EOS)
    {
        if (linha[i] == '|')
        {
            if (atual == campo) break;
            atual++;
            i++;
            continue;
        }
        if (atual == campo && j < tamanho - 1)
        {
            destino[j] = linha[i];
            j++;
        }
        i++;
    }
    destino[j] = EOS;
    return (atual >= campo);
}

// Tudo a partir do campo número "campo" (usado no texto, que pode conter |)
stock SAMS_Resto(const linha[], campo, destino[], tamanho)
{
    new atual = 0, i = 0, j = 0;
    destino[0] = EOS;
    while (linha[i] != EOS && atual < campo)
    {
        if (linha[i] == '|') atual++;
        i++;
    }
    while (linha[i] != EOS && j < tamanho - 1)
    {
        // "\n" escrito no arquivo vira quebra de linha de verdade
        if (linha[i] == '\\' && linha[i + 1] == 'n')
        {
            destino[j] = '\n';
            i += 2;
        }
        else
        {
            destino[j] = linha[i];
            i++;
        }
        j++;
    }
    destino[j] = EOS;
    return j;
}

stock Float:SAMS_Float(const linha[], campo)
{
    new valor[32];
    SAMS_Campo(linha, campo, valor, sizeof(valor));
    return floatstr(valor);
}

stock SAMS_Int(const linha[], campo)
{
    new valor[32];
    SAMS_Campo(linha, campo, valor, sizeof(valor));
    return strval(valor);
}

stock SAMS_LimparLinha(linha[])
{
    new n = strlen(linha);
    while (n > 0 && (linha[n - 1] == '\r' || linha[n - 1] == '\n'))
    {
        n--;
        linha[n] = EOS;
    }
}

stock SAMS_CarregarMapa()
{
    new File:arquivo = fopen(SAMS_ARQUIVO, io_read);
    if (!arquivo)
    {
        print("[SA Map Studio] Nao encontrei " SAMS_ARQUIVO);
        return 0;
    }
    new linha[1024], tipo[4], txd[64], textura[64], fonte[64], texto[900];
    new Float:sumX = 0.0, Float:sumY = 0.0, Float:sumZ = 0.0;
    new countCoords = 0;

    while (fread(arquivo, linha))
    {
        SAMS_LimparLinha(linha);
        if (linha[0] == EOS || linha[1] != '|') continue;
        SAMS_Campo(linha, 0, tipo, sizeof(tipo));
        switch (tipo[0])
        {
            case 'S':
            {
                gSpawn[0] = SAMS_Float(linha, 1);
                gSpawn[1] = SAMS_Float(linha, 2);
                gSpawn[2] = SAMS_Float(linha, 3);
                gSpawn[3] = SAMS_Float(linha, 4);
                gSpawnInterior = SAMS_Int(linha, 5);
                gSpawnMundo = SAMS_Int(linha, 6);
                gJetpack = (SAMS_Int(linha, 7) != 0);
            }
            case 'E':
            {
                gClima = SAMS_Int(linha, 1);
                if (gClima < 0 || gClima > 45) gClima = 10;
                gHora = SAMS_Int(linha, 2);
                if (gHora < 0 || gHora > 23) gHora = 10;
                gMinuto = SAMS_Int(linha, 3);
                if (gMinuto < 0 || gMinuto > 59) gMinuto = 0;
            }
            case 'C':
            {
                gMapCenter[0] = SAMS_Float(linha, 1);
                gMapCenter[1] = SAMS_Float(linha, 2);
                gMapCenter[2] = SAMS_Float(linha, 3);
                gHasMapCenter = true;
            }
            case 'O':
            {
                if (gTotalObjetos >= SAMS_MAX_OBJETOS)
                {
                    gIgnorados++;
                    continue;
                }
                new Float:ox = SAMS_Float(linha, 2);
                new Float:oy = SAMS_Float(linha, 3);
                new Float:oz = SAMS_Float(linha, 4);
                new id = CreateObject(SAMS_Int(linha, 1),
                    ox, oy, oz,
                    SAMS_Float(linha, 5), SAMS_Float(linha, 6), SAMS_Float(linha, 7),
                    SAMS_Float(linha, 8));
                gObjetos[gTotalObjetos] = id;
                gTotalObjetos++;
                if (id == INVALID_OBJECT_ID) gIgnorados++;

                sumX += ox;
                sumY += oy;
                sumZ += oz;
                countCoords++;
            }
            case 'M':
            {
                new indice = SAMS_Int(linha, 1);
                if (indice < 0 || indice >= gTotalObjetos || gObjetos[indice] == INVALID_OBJECT_ID) continue;
                SAMS_Campo(linha, 4, txd, sizeof(txd));
                SAMS_Campo(linha, 5, textura, sizeof(textura));
                SetObjectMaterial(gObjetos[indice], SAMS_Int(linha, 2), SAMS_Int(linha, 3), txd, textura, SAMS_Int(linha, 6));
            }
            case 'T':
            {
                new indice = SAMS_Int(linha, 1);
                if (indice < 0 || indice >= gTotalObjetos || gObjetos[indice] == INVALID_OBJECT_ID) continue;
                SAMS_Campo(linha, 9, fonte, sizeof(fonte));
                SAMS_Resto(linha, 10, texto, sizeof(texto));
                SetObjectMaterialText(gObjetos[indice], texto, SAMS_Int(linha, 2), SAMS_Int(linha, 3), fonte,
                    SAMS_Int(linha, 4), SAMS_Int(linha, 5), SAMS_Int(linha, 6), SAMS_Int(linha, 7), SAMS_Int(linha, 8));
            }
            case 'R':
            {
                if (gTotalRemovidos >= SAMS_MAX_REMOVIDOS) continue;
                gRemovidosModelo[gTotalRemovidos] = SAMS_Int(linha, 1);
                gRemovidos[gTotalRemovidos][0] = SAMS_Float(linha, 2);
                gRemovidos[gTotalRemovidos][1] = SAMS_Float(linha, 3);
                gRemovidos[gTotalRemovidos][2] = SAMS_Float(linha, 4);
                gRemovidos[gTotalRemovidos][3] = SAMS_Float(linha, 5);
                gTotalRemovidos++;
            }
            case 'V':
            {
                if (gTotalVeiculos >= SAMS_MAX_VEICULOS) continue;
                new Float:vx = SAMS_Float(linha, 2);
                new Float:vy = SAMS_Float(linha, 3);
                new Float:vz = SAMS_Float(linha, 4);
                CreateVehicle(SAMS_Int(linha, 1), vx, vy, vz,
                    SAMS_Float(linha, 5), SAMS_Int(linha, 6), SAMS_Int(linha, 7), -1);
                gTotalVeiculos++;

                sumX += vx;
                sumY += vy;
                sumZ += vz;
                countCoords++;
            }
            case 'A':
            {
                if (gTotalActors >= SAMS_MAX_ACTORS) continue;
                new skin = SAMS_Int(linha, 1);
                new Float:ax = SAMS_Float(linha, 2);
                new Float:ay = SAMS_Float(linha, 3);
                new Float:az = SAMS_Float(linha, 4);
                new Float:aa = SAMS_Float(linha, 5);
                new actorid = CreateActor(skin, ax, ay, az, aa);
                if (actorid != INVALID_ACTOR_ID)
                {
                    new world = SAMS_Int(linha, 6);
                    if (world != 0) SetActorVirtualWorld(actorid, world);
                    new inv = SAMS_Int(linha, 7);
                    if (inv != 0) SetActorInvulnerable(actorid, true);
                    new animLib[32], animName[32];
                    SAMS_Campo(linha, 8, animLib, sizeof(animLib));
                    SAMS_Campo(linha, 9, animName, sizeof(animName));
                    if (animLib[0] != EOS && animName[0] != EOS)
                    {
                        new Float:delta = SAMS_Float(linha, 10);
                        if (delta <= 0.0) delta = 4.1;
                        new loop = SAMS_Int(linha, 11);
                        new lockx = SAMS_Int(linha, 12);
                        new locky = SAMS_Int(linha, 13);
                        new freeze = SAMS_Int(linha, 14);
                        new time = SAMS_Int(linha, 15);

                        gActorAnim[gTotalActors][act_hasAnim] = true;
                        format(gActorAnim[gTotalActors][act_lib], 32, "%s", animLib);
                        format(gActorAnim[gTotalActors][act_name], 32, "%s", animName);
                        gActorAnim[gTotalActors][act_delta] = delta;
                        gActorAnim[gTotalActors][act_loop] = bool:loop;
                        gActorAnim[gTotalActors][act_lockx] = bool:lockx;
                        gActorAnim[gTotalActors][act_locky] = bool:locky;
                        gActorAnim[gTotalActors][act_freeze] = bool:freeze;
                        gActorAnim[gTotalActors][act_time] = time;

                        new bool:libJaExiste = false;
                        for (new l = 0; l < gTotalAnimLibs; l++)
                        {
                            if (!strcmp(gAnimLibs[l], animLib, true))
                            {
                                libJaExiste = true;
                                break;
                            }
                        }
                        if (!libJaExiste && gTotalAnimLibs < sizeof(gAnimLibs))
                        {
                            format(gAnimLibs[gTotalAnimLibs], 32, "%s", animLib);
                            gTotalAnimLibs++;
                        }

                        ApplyActorAnimation(actorid, animLib, animName, delta, bool:loop, bool:lockx, bool:locky, bool:freeze, time);
                    }
                    else
                    {
                        gActorAnim[gTotalActors][act_hasAnim] = false;
                    }
                    gActors[gTotalActors] = actorid;
                    gTotalActors++;

                    sumX += ax;
                    sumY += ay;
                    sumZ += az;
                    countCoords++;
                }
            }
        }
    }
    fclose(arquivo);

    if (!gHasMapCenter && countCoords > 0)
    {
        gMapCenter[0] = sumX / float(countCoords);
        gMapCenter[1] = sumY / float(countCoords);
        gMapCenter[2] = (sumZ / float(countCoords)) + 1.5;
        gHasMapCenter = true;
    }

    printf("[SA Map Studio] %d objetos, %d predios removidos, %d veiculos, %d actors (%d ignorados)", gTotalObjetos, gTotalRemovidos, gTotalVeiculos, gTotalActors, gIgnorados);
    printf("[SA Map Studio] Clima: %d, Horario: %02d:%02d, Centro do mapa: %.2f, %.2f, %.2f", gClima, gHora, gMinuto, gMapCenter[0], gMapCenter[1], gMapCenter[2]);
    return 1;
}

public OnGameModeInit()
{
    SetGameModeText("SA Map Studio");
    UsePlayerPedAnims();
    DisableInteriorEnterExits();
    ShowPlayerMarkers(PLAYER_MARKERS_MODE_OFF);
    AddPlayerClass(0, 0.0, 0.0, 3.0, 0.0, 0, 0, 0, 0, 0, 0);
    SAMS_CarregarMapa();
    SetWorldTime(gHora);
    SetWeather(gClima);
    return 1;
}

// Pre-carrega todas as bibliotecas IFP necessarias no cliente do jogador
stock SAMS_PreloadAllAnims(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    for (new i = 0; i < gTotalAnimLibs; i++)
    {
        ApplyAnimation(playerid, gAnimLibs[i], "null", 0.0, false, false, false, false, 0);
    }
    return 1;
}

// Sincroniza e reaplica as animacoes de todos os actors para o jogador
forward SAMS_SyncActorAnims(playerid);
public SAMS_SyncActorAnims(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    SAMS_PreloadAllAnims(playerid);
    for (new i = 0; i < gTotalActors; i++)
    {
        if (gActorAnim[i][act_hasAnim])
        {
            ApplyActorAnimation(gActors[i], gActorAnim[i][act_lib], gActorAnim[i][act_name],
                gActorAnim[i][act_delta], gActorAnim[i][act_loop], gActorAnim[i][act_lockx],
                gActorAnim[i][act_locky], gActorAnim[i][act_freeze], gActorAnim[i][act_time]);
        }
    }
    return 1;
}

// Quando um actor entra na area visivel (stream-in) de um jogador, assegura a animacao ativa
public OnActorStreamIn(actorid, forplayerid)
{
    for (new i = 0; i < gTotalActors; i++)
    {
        if (gActors[i] == actorid && gActorAnim[i][act_hasAnim])
        {
            ApplyAnimation(forplayerid, gActorAnim[i][act_lib], "null", 0.0, false, false, false, false, 0);
            ApplyActorAnimation(actorid, gActorAnim[i][act_lib], gActorAnim[i][act_name],
                gActorAnim[i][act_delta], gActorAnim[i][act_loop], gActorAnim[i][act_lockx],
                gActorAnim[i][act_locky], gActorAnim[i][act_freeze], gActorAnim[i][act_time]);
            break;
        }
    }
    return 1;
}

public OnPlayerConnect(playerid)
{
    gNoClip[playerid][noclip_cameramode] = CAMERA_MODE_NONE;
    gNoClip[playerid][noclip_flyobject] = INVALID_OBJECT_ID;
    gNoClip[playerid][noclip_lrold] = 0;
    gNoClip[playerid][noclip_udold] = 0;
    gNoClip[playerid][noclip_mode] = 0;
    gNoClip[playerid][noclip_lastmove] = 0;
    gNoClip[playerid][noclip_accelmul] = 0.0;
    gReturningFromFly[playerid] = false;

    SetPlayerTime(playerid, gHora, gMinuto);
    SetPlayerWeather(playerid, gClima);

    for (new i = 0; i < gTotalRemovidos; i++)
    {
        RemoveBuildingForPlayer(playerid, gRemovidosModelo[i], gRemovidos[i][0], gRemovidos[i][1], gRemovidos[i][2], gRemovidos[i][3]);
    }
    SAMS_PreloadAllAnims(playerid);
    return 1;
}

public OnPlayerDisconnect(playerid, reason)
{
    if (gNoClip[playerid][noclip_cameramode] == CAMERA_MODE_FLY)
    {
        DestroyPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);
        gNoClip[playerid][noclip_cameramode] = CAMERA_MODE_NONE;
    }
    gReturningFromFly[playerid] = false;
    return 1;
}

// Pula a escolha de personagem: liga e desliga o modo espectador, o que faz o jogo
// spawnar o jogador direto no ponto definido por SetSpawnInfo.
public OnPlayerRequestClass(playerid, classid)
{
    SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    TogglePlayerSpectating(playerid, true);
    SetTimerEx("SAMS_Spawnar", 150, false, "i", playerid);
    return 1;
}

forward SAMS_Spawnar(playerid);
public SAMS_Spawnar(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    TogglePlayerSpectating(playerid, false);
    return 1;
}

public OnPlayerRequestSpawn(playerid)
{
    return 1;
}

stock SAMS_IrParaSpawn(playerid)
{
    SetPlayerInterior(playerid, gSpawnInterior);
    SetPlayerVirtualWorld(playerid, gSpawnMundo);
    SetPlayerPos(playerid, gSpawn[0], gSpawn[1], gSpawn[2]);
    SetPlayerFacingAngle(playerid, gSpawn[3]);
    SetCameraBehindPlayer(playerid);
    if (gJetpack) SetPlayerSpecialAction(playerid, SPECIAL_ACTION_USEJETPACK);
}

public OnPlayerSpawn(playerid)
{
    if (gReturningFromFly[playerid])
    {
        SAMS_RestaurarPosVoo(playerid);
        return 1;
    }

    SAMS_IrParaSpawn(playerid);
    SetPlayerTime(playerid, gHora, gMinuto);
    SetPlayerWeather(playerid, gClima);
    SAMS_PreloadAllAnims(playerid);
    SetTimerEx("SAMS_SyncActorAnims", 500, false, "i", playerid);
    SetTimerEx("SAMS_SyncActorAnims", 1500, false, "i", playerid);
    SendClientMessage(playerid, SAMS_COR_INFO, "SA Map Studio: teste do mapa.");
    SendClientMessage(playerid, SAMS_COR_OK, "Comandos: /fly (/voar)  /map (/mapa)  /w [clima]  /t [hora]  /anim  /jetpack  /v [modelo]  /spawn  /pos");
    return 1;
}

// ---------------------------------------------------------------------------
// Sistema de voo livre da camera (/fly e /voar)
// ---------------------------------------------------------------------------
stock GetMoveDirectionFromKeys(ud, lr)
{
    new direction = 0;
    if (lr < 0)
    {
        if (ud < 0) direction = MOVE_FORWARD_LEFT;
        else if (ud > 0) direction = MOVE_BACK_LEFT;
        else direction = MOVE_LEFT;
    }
    else if (lr > 0)
    {
        if (ud < 0) direction = MOVE_FORWARD_RIGHT;
        else if (ud > 0) direction = MOVE_BACK_RIGHT;
        else direction = MOVE_RIGHT;
    }
    else if (ud < 0) direction = MOVE_FORWARD;
    else if (ud > 0) direction = MOVE_BACK;
    return direction;
}

stock GetNextCameraPosition(move_mode, const Float:CP[3], const Float:FV[3], &Float:X, &Float:Y, &Float:Z)
{
    new Float:ox = FV[0] * 6000.0;
    new Float:oy = FV[1] * 6000.0;
    new Float:oz = FV[2] * 6000.0;
    switch (move_mode)
    {
        case MOVE_FORWARD:        { X = CP[0] + ox; Y = CP[1] + oy; Z = CP[2] + oz; }
        case MOVE_BACK:           { X = CP[0] - ox; Y = CP[1] - oy; Z = CP[2] - oz; }
        case MOVE_LEFT:           { X = CP[0] - oy; Y = CP[1] + ox; Z = CP[2]; }
        case MOVE_RIGHT:          { X = CP[0] + oy; Y = CP[1] - ox; Z = CP[2]; }
        case MOVE_BACK_LEFT:      { X = CP[0] - ox - oy; Y = CP[1] - oy + ox; Z = CP[2] - oz; }
        case MOVE_BACK_RIGHT:     { X = CP[0] - ox + oy; Y = CP[1] - oy - ox; Z = CP[2] - oz; }
        case MOVE_FORWARD_LEFT:   { X = CP[0] + ox - oy; Y = CP[1] + oy + ox; Z = CP[2] + oz; }
        case MOVE_FORWARD_RIGHT:  { X = CP[0] + ox + oy; Y = CP[1] + oy - ox; Z = CP[2] + oz; }
    }
}

stock MoveCamera(playerid)
{
    new Float:FV[3], Float:CP[3];
    GetPlayerCameraPos(playerid, CP[0], CP[1], CP[2]);
    GetPlayerCameraFrontVector(playerid, FV[0], FV[1], FV[2]);

    if (gNoClip[playerid][noclip_accelmul] <= 1.0) gNoClip[playerid][noclip_accelmul] += FLY_ACCEL_RATE;
    new Float:speed = FLY_MOVE_SPEED * gNoClip[playerid][noclip_accelmul];

    new Float:X, Float:Y, Float:Z;
    GetNextCameraPosition(gNoClip[playerid][noclip_mode], CP, FV, X, Y, Z);
    MovePlayerObject(playerid, gNoClip[playerid][noclip_flyobject], X, Y, Z, speed);

    gNoClip[playerid][noclip_lastmove] = GetTickCount();
    return 1;
}

public OnPlayerUpdate(playerid)
{
    if (gNoClip[playerid][noclip_cameramode] == CAMERA_MODE_FLY)
    {
        new keys, ud, lr;
        GetPlayerKeys(playerid, keys, ud, lr);

        if (gNoClip[playerid][noclip_mode] && (GetTickCount() - gNoClip[playerid][noclip_lastmove] > 100))
        {
            MoveCamera(playerid);
        }

        if (gNoClip[playerid][noclip_udold] != ud || gNoClip[playerid][noclip_lrold] != lr)
        {
            if ((gNoClip[playerid][noclip_udold] != 0 || gNoClip[playerid][noclip_lrold] != 0) && ud == 0 && lr == 0)
            {
                StopPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);
                gNoClip[playerid][noclip_mode] = 0;
                gNoClip[playerid][noclip_accelmul] = 0.0;
            }
            else
            {
                gNoClip[playerid][noclip_mode] = GetMoveDirectionFromKeys(ud, lr);
                MoveCamera(playerid);
            }
        }
        gNoClip[playerid][noclip_udold] = ud;
        gNoClip[playerid][noclip_lrold] = lr;
        return 0;
    }
    return 1;
}

stock IniciarFlyMode(playerid)
{
    GetPlayerPos(playerid, gFlySavedPos[playerid][0], gFlySavedPos[playerid][1], gFlySavedPos[playerid][2]);
    GetPlayerFacingAngle(playerid, gFlySavedPos[playerid][3]);
    gFlySavedInterior[playerid] = GetPlayerInterior(playerid);
    gFlySavedWorld[playerid] = GetPlayerVirtualWorld(playerid);

    gNoClip[playerid][noclip_flyobject] = CreatePlayerObject(playerid, 19300, gFlySavedPos[playerid][0], gFlySavedPos[playerid][1], gFlySavedPos[playerid][2], 0.0, 0.0, 0.0);
    TogglePlayerSpectating(playerid, true);
    AttachCameraToPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);

    gNoClip[playerid][noclip_cameramode] = CAMERA_MODE_FLY;
    gNoClip[playerid][noclip_accelmul] = 0.0;
    gNoClip[playerid][noclip_mode] = 0;
    gNoClip[playerid][noclip_lastmove] = 0;
    gNoClip[playerid][noclip_udold] = 0;
    gNoClip[playerid][noclip_lrold] = 0;

    SendClientMessage(playerid, SAMS_COR_OK, "Modo voo livre ativado! W/S/A/D para mover, mouse para olhar. Digite /fly ou /voar para sair.");
    return 1;
}

stock CancelarFlyMode(playerid)
{
    if (gNoClip[playerid][noclip_cameramode] != CAMERA_MODE_FLY) return 0;
    DestroyPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);
    gNoClip[playerid][noclip_cameramode] = CAMERA_MODE_NONE;
    gReturningFromFly[playerid] = true;
    TogglePlayerSpectating(playerid, false);
    SetTimerEx("SAMS_RestaurarPosVoo", 150, false, "i", playerid);
    return 1;
}

forward SAMS_RestaurarPosVoo(playerid);
public SAMS_RestaurarPosVoo(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    SetPlayerInterior(playerid, gFlySavedInterior[playerid]);
    SetPlayerVirtualWorld(playerid, gFlySavedWorld[playerid]);
    SetPlayerPos(playerid, gFlySavedPos[playerid][0], gFlySavedPos[playerid][1], gFlySavedPos[playerid][2]);
    SetPlayerFacingAngle(playerid, gFlySavedPos[playerid][3]);
    SetCameraBehindPlayer(playerid);
    gReturningFromFly[playerid] = false;
    SetTimerEx("SAMS_SyncActorAnims", 500, false, "i", playerid);
    SendClientMessage(playerid, SAMS_COR_INFO, "Modo voo desativado. Voce retornou a posicao onde o voo foi ativado.");
    return 1;
}

public OnPlayerCommandText(playerid, cmdtext[])
{
    // Ativa / Desativa o modo voo da camera
    if (!strcmp(cmdtext, "/fly", true) || !strcmp(cmdtext, "/voar", true))
    {
        if (gNoClip[playerid][noclip_cameramode] == CAMERA_MODE_FLY)
        {
            CancelarFlyMode(playerid);
        }
        else
        {
            IniciarFlyMode(playerid);
        }
        return 1;
    }

    // Sincroniza e reaplica animacoes dos actors
    if (!strcmp(cmdtext, "/anim", true) || !strcmp(cmdtext, "/reanim", true) || !strcmp(cmdtext, "/animar", true))
    {
        SAMS_SyncActorAnims(playerid);
        SendClientMessage(playerid, SAMS_COR_OK, "Animacoes dos actors sincronizadas e reaplicadas.");
        return 1;
    }

    // Teleporta para o centro do mapa
    if (!strcmp(cmdtext, "/map", true) || !strcmp(cmdtext, "/mapa", true))
    {
        if (gNoClip[playerid][noclip_cameramode] == CAMERA_MODE_FLY)
        {
            StopPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);
            SetPlayerObjectPos(playerid, gNoClip[playerid][noclip_flyobject], gMapCenter[0], gMapCenter[1], gMapCenter[2]);
            SendClientMessage(playerid, SAMS_COR_OK, "Camera teleportada para o centro do mapa.");
            return 1;
        }

        if (IsPlayerInAnyVehicle(playerid))
        {
            new veiculo = GetPlayerVehicleID(playerid);
            SetVehiclePos(veiculo, gMapCenter[0], gMapCenter[1], gMapCenter[2] + 1.0);
            LinkVehicleToInterior(veiculo, gSpawnInterior);
            SetVehicleVirtualWorld(veiculo, gSpawnMundo);
        }
        else
        {
            SetPlayerInterior(playerid, gSpawnInterior);
            SetPlayerVirtualWorld(playerid, gSpawnMundo);
            SetPlayerPos(playerid, gMapCenter[0], gMapCenter[1], gMapCenter[2]);
            SetCameraBehindPlayer(playerid);
        }
        SendClientMessage(playerid, SAMS_COR_OK, "Teleportado para o centro do mapa em teste.");
        return 1;
    }

    if (!strcmp(cmdtext, "/jetpack", true))
    {
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_USEJETPACK);
        return 1;
    }
    if (!strcmp(cmdtext, "/spawn", true))
    {
        if (gNoClip[playerid][noclip_cameramode] == CAMERA_MODE_FLY) CancelarFlyMode(playerid);
        SAMS_IrParaSpawn(playerid);
        return 1;
    }
    if (!strcmp(cmdtext, "/pos", true))
    {
        new Float:x, Float:y, Float:z, Float:a, msg[128];
        GetPlayerPos(playerid, x, y, z);
        GetPlayerFacingAngle(playerid, a);
        format(msg, sizeof(msg), "Posicao: %.4f, %.4f, %.4f  Angulo: %.1f  Interior: %d", x, y, z, a, GetPlayerInterior(playerid));
        SendClientMessage(playerid, SAMS_COR_OK, msg);
        printf("[SA Map Studio] %s", msg);
        return 1;
    }
    if (!strcmp(cmdtext, "/v", true, 2) && (cmdtext[2] == ' ' || cmdtext[2] == EOS))
    {
        new modelo = (cmdtext[2] == ' ') ? strval(cmdtext[3]) : 411;
        if (modelo < 400 || modelo > 611)
        {
            SendClientMessage(playerid, SAMS_COR_INFO, "Use /v [modelo], de 400 a 611.");
            return 1;
        }
        new Float:x, Float:y, Float:z, Float:a;
        GetPlayerPos(playerid, x, y, z);
        GetPlayerFacingAngle(playerid, a);
        new veiculo = CreateVehicle(modelo, x, y, z + 1.0, a, -1, -1, -1);
        LinkVehicleToInterior(veiculo, GetPlayerInterior(playerid));
        SetVehicleVirtualWorld(veiculo, GetPlayerVirtualWorld(playerid));
        PutPlayerInVehicle(playerid, veiculo, 0);
        return 1;
    }

    // Altera o clima do servidor e jogadores (/w [clima], /weather, /clima)
    if ((!strcmp(cmdtext, "/w", true, 2) && (cmdtext[2] == ' ' || cmdtext[2] == EOS)) ||
        (!strcmp(cmdtext, "/weather", true, 8) && (cmdtext[8] == ' ' || cmdtext[8] == EOS)) ||
        (!strcmp(cmdtext, "/clima", true, 6) && (cmdtext[6] == ' ' || cmdtext[6] == EOS)))
    {
        new paramIdx = 0;
        if (!strcmp(cmdtext, "/w", true, 2)) paramIdx = 2;
        else if (!strcmp(cmdtext, "/weather", true, 8)) paramIdx = 8;
        else if (!strcmp(cmdtext, "/clima", true, 6)) paramIdx = 6;

        while (cmdtext[paramIdx] == ' ') paramIdx++;

        if (cmdtext[paramIdx] == EOS)
        {
            new msg[128];
            format(msg, sizeof(msg), "Uso: /w [0 a 45] (ou /weather, /clima) - Clima atual: %d", gClima);
            SendClientMessage(playerid, SAMS_COR_INFO, msg);
            return 1;
        }

        new novoClima = strval(cmdtext[paramIdx]);
        if (novoClima < 0 || novoClima > 255)
        {
            SendClientMessage(playerid, SAMS_COR_INFO, "ID de clima invalido! Escolha um valor entre 0 e 45.");
            return 1;
        }

        gClima = novoClima;
        SetWeather(gClima);
        for (new i = 0; i < MAX_PLAYERS; i++)
        {
            if (IsPlayerConnected(i)) SetPlayerWeather(i, gClima);
        }

        new msg[128];
        format(msg, sizeof(msg), "Clima alterado para %d.", gClima);
        SendClientMessage(playerid, SAMS_COR_OK, msg);
        printf("[SA Map Studio] Clima alterado para %d por player %d.", gClima, playerid);
        return 1;
    }

    // Altera o horario do servidor e jogadores (/t [hora] [minuto], /time, /hora, /tempo)
    if ((!strcmp(cmdtext, "/t", true, 2) && (cmdtext[2] == ' ' || cmdtext[2] == EOS)) ||
        (!strcmp(cmdtext, "/time", true, 5) && (cmdtext[5] == ' ' || cmdtext[5] == EOS)) ||
        (!strcmp(cmdtext, "/hora", true, 5) && (cmdtext[5] == ' ' || cmdtext[5] == EOS)) ||
        (!strcmp(cmdtext, "/tempo", true, 6) && (cmdtext[6] == ' ' || cmdtext[6] == EOS)))
    {
        new paramIdx = 0;
        if (!strcmp(cmdtext, "/t", true, 2)) paramIdx = 2;
        else if (!strcmp(cmdtext, "/time", true, 5)) paramIdx = 5;
        else if (!strcmp(cmdtext, "/hora", true, 5)) paramIdx = 5;
        else if (!strcmp(cmdtext, "/tempo", true, 6)) paramIdx = 6;

        while (cmdtext[paramIdx] == ' ') paramIdx++;

        if (cmdtext[paramIdx] == EOS)
        {
            new msg[128];
            format(msg, sizeof(msg), "Uso: /t [0-23] [minutos] ou /t HH:MM (ex: /t 12 ou /t 22:30) - Horario atual: %02d:%02d", gHora, gMinuto);
            SendClientMessage(playerid, SAMS_COR_INFO, msg);
            return 1;
        }

        new hora = 0, minuto = 0;
        new colonPos = -1, spacePos = -1;
        for (new i = paramIdx; cmdtext[i] != EOS; i++)
        {
            if (cmdtext[i] == ':' && colonPos == -1) colonPos = i;
            if (cmdtext[i] == ' ' && spacePos == -1) spacePos = i;
        }

        if (colonPos != -1)
        {
            hora = strval(cmdtext[paramIdx]);
            minuto = strval(cmdtext[colonPos + 1]);
        }
        else if (spacePos != -1)
        {
            hora = strval(cmdtext[paramIdx]);
            new mIdx = spacePos;
            while (cmdtext[mIdx] == ' ') mIdx++;
            minuto = strval(cmdtext[mIdx]);
        }
        else
        {
            hora = strval(cmdtext[paramIdx]);
            minuto = 0;
        }

        if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59)
        {
            SendClientMessage(playerid, SAMS_COR_INFO, "Horario invalido! Use hora de 0 a 23 e minutos de 0 a 59 (ex: /t 14 ou /t 14:30).");
            return 1;
        }

        gHora = hora;
        gMinuto = minuto;
        SetWorldTime(gHora);
        for (new i = 0; i < MAX_PLAYERS; i++)
        {
            if (IsPlayerConnected(i)) SetPlayerTime(i, gHora, gMinuto);
        }

        new msg[128];
        format(msg, sizeof(msg), "Horario alterado para %02d:%02d.", gHora, gMinuto);
        SendClientMessage(playerid, SAMS_COR_OK, msg);
        printf("[SA Map Studio] Horario alterado para %02d:%02d por player %d.", gHora, gMinuto, playerid);
        return 1;
    }

    // Ajuda e lista de comandos
    if (!strcmp(cmdtext, "/ajuda", true) || !strcmp(cmdtext, "/help", true) || !strcmp(cmdtext, "/comandos", true))
    {
        SendClientMessage(playerid, SAMS_COR_INFO, "Comandos do servidor de teste:");
        SendClientMessage(playerid, SAMS_COR_OK, "  /fly (/voar) - Alternar voo livre da camera");
        SendClientMessage(playerid, SAMS_COR_OK, "  /map (/mapa) - Teleportar ao centro do mapa em teste");
        SendClientMessage(playerid, SAMS_COR_OK, "  /w [0-45] - Alterar clima (ex: /w 10)");
        SendClientMessage(playerid, SAMS_COR_OK, "  /t [0-23] [min] - Alterar horario (ex: /t 12 ou /t 22:30)");
        SendClientMessage(playerid, SAMS_COR_OK, "  /v [modelo] - Criar veiculo (ex: /v 411)");
        SendClientMessage(playerid, SAMS_COR_OK, "  /anim - Ressincronizar animacoes dos actors");
        SendClientMessage(playerid, SAMS_COR_OK, "  /jetpack, /spawn, /pos - Utilidades gerais");
        return 1;
    }
    return 0;
}
