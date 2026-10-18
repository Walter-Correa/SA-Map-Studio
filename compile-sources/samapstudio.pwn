// ===========================================================================
// SA Map Studio - gamemode de teste
// Lê o mapa de scriptfiles/samapstudio/mapa.txt (gerado pelo editor), cria os
// objetos, as trocas de textura e texto, remove os prédios e coloca o jogador
// no ponto escolhido. Usa só funções nativas do SA-MP/open.mp (sem plugins).
#define SAMP_COMPAT
#include <open.mp>
#include <streamer>

#define SAMSP_ARQUIVO        "samapstudio/mapa.txt"
#define SAMSP_MAX_OBJETOS    5000
#define SAMSP_MAX_REMOVIDOS  500
#define SAMSP_MAX_VEICULOS   500
#define SAMSP_MAX_ACTORS     250
#define SAMSP_MAX_LABELS     500
#define SAMSP_MAX_PICKUPS    500
#define SAMSP_MAX_GANGZONES   200
#define SAMSP_MAX_TEXTDRAWS   256
#define SAMSP_MAX_CHECKPOINTS 256
#define SAMSP_MAX_MAPICONS    200
#define SAMSP_MAX_SOUNDS      256
#define SAMSP_COR_INFO       0xF0A630FF
#define SAMSP_COR_OK         0x57B77AFF

new bool:gUseStreamer = false;

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
new bool:gPlayerSpawned[MAX_PLAYERS];

new gObjetos[SAMSP_MAX_OBJETOS];
new gTotalObjetos;
new Float:gRemovidos[SAMSP_MAX_REMOVIDOS][4];
new gRemovidosModelo[SAMSP_MAX_REMOVIDOS];
new gTotalRemovidos;
new gVeiculos[SAMSP_MAX_VEICULOS];
new gVeiculoComps[SAMSP_MAX_VEICULOS][16];
new gVeiculoTotalComps[SAMSP_MAX_VEICULOS];
new gVeiculoPaintjob[SAMSP_MAX_VEICULOS];
new gTotalVeiculos;
new gTotalActors;
new gActors[SAMSP_MAX_ACTORS];

new Text3D:gLabels[SAMSP_MAX_LABELS];
new gTotalLabels;
new gPickups[SAMSP_MAX_PICKUPS];
new gTotalPickups;
new gGangZones[SAMSP_MAX_GANGZONES];
new gGangZoneColors[SAMSP_MAX_GANGZONES];
new gTotalGangZones;
new Text:gTextDraws[SAMSP_MAX_TEXTDRAWS];
new gTotalTextDraws;

enum E_SAMSP_CP
{
    bool:cp_isRace,
    cp_type,
    Float:cp_x,
    Float:cp_y,
    Float:cp_z,
    Float:cp_nx,
    Float:cp_ny,
    Float:cp_nz,
    Float:cp_size
}
new gCheckpoints[SAMSP_MAX_CHECKPOINTS][E_SAMSP_CP];
new gTotalCheckpoints;
new gPlayerNormalCPIdx[MAX_PLAYERS];
new gPlayerRaceCPIdx[MAX_PLAYERS];

enum E_SAMSP_MAPICON
{
    mi_iconid,
    Float:mi_x,
    Float:mi_y,
    Float:mi_z,
    mi_type,
    mi_color,
    mi_style
}
new gMapIcons[SAMSP_MAX_MAPICONS][E_SAMSP_MAPICON];
new gTotalMapIcons;

enum E_SAMSP_SOUND
{
    snd_id,
    Float:snd_x,
    Float:snd_y,
    Float:snd_z
}
new gSounds[SAMSP_MAX_SOUNDS][E_SAMSP_SOUND];
new gTotalSounds;

enum E_SAMSP_ACTOR_ANIM
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
new gActorAnim[SAMSP_MAX_ACTORS][E_SAMSP_ACTOR_ANIM];
new gAnimLibs[64][32];
new gTotalAnimLibs = 0;
new gIgnorados;
new Float:gSpawn[4] = {0.0, 0.0, 3.0, 0.0};
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
stock SAMSP_Campo(const linha[], campo, destino[], tamanho)
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
stock SAMSP_Resto(const linha[], campo, destino[], tamanho)
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

stock Float:SAMSP_Float(const linha[], campo)
{
    new valor[32];
    SAMSP_Campo(linha, campo, valor, sizeof(valor));
    return floatstr(valor);
}

stock SAMSP_Int(const linha[], campo)
{
    new valor[32];
    SAMSP_Campo(linha, campo, valor, sizeof(valor));
    return strval(valor);
}

stock SAMSP_HexOrInt(const linha[], campo)
{
    new valor[32];
    SAMSP_Campo(linha, campo, valor, sizeof(valor));
    if (valor[0] == '0' && (valor[1] == 'x' || valor[1] == 'X'))
    {
        new ret = 0, i = 2;
        while (valor[i] != EOS)
        {
            new c = valor[i];
            new digit = 0;
            if (c >= '0' && c <= '9') digit = c - '0';
            else if (c >= 'a' && c <= 'f') digit = c - 'a' + 10;
            else if (c >= 'A' && c <= 'F') digit = c - 'A' + 10;
            else break;
            ret = (ret << 4) | digit;
            i++;
        }
        return ret;
    }
    return strval(valor);
}



stock SAMSP_LimparLinha(linha[])
{
    new n = strlen(linha);
    while (n > 0 && (linha[n - 1] == '\r' || linha[n - 1] == '\n'))
    {
        n--;
        linha[n] = EOS;
    }
}

stock SAMSP_ToLower(c)
{
    if (c >= 'A' && c <= 'Z') return c + ('a' - 'A');
    return c;
}

stock SAMSP_ToUpper(c)
{
    if (c >= 'a' && c <= 'z') return c - ('a' - 'A');
    return c;
}

stock SAMSP_NormalizeSprite(texto[], maxlen)
{
    new start = 0;
    while (texto[start] == ' ' || texto[start] == '\t' || texto[start] == '"' || texto[start] == '\'') start++;
    if (start > 0)
    {
        new i = 0;
        while (texto[start + i] != EOS)
        {
            texto[i] = texto[start + i];
            i++;
        }
        texto[i] = EOS;
    }
    new len = strlen(texto);
    while (len > 0 && (texto[len - 1] == ' ' || texto[len - 1] == '\t' || texto[len - 1] == '"' || texto[len - 1] == '\'' || texto[len - 1] == '\r' || texto[len - 1] == '\n'))
    {
        len--;
        texto[len] = EOS;
    }

    if (texto[0] == EOS)
    {
        format(texto, maxlen, "hud:radardisc");
        return;
    }

    new colon = -1;
    for (new i = 0; texto[i] != EOS; i++)
    {
        if (texto[i] == ':')
        {
            colon = i;
            break;
        }
    }

    if (colon == -1)
    {
        new tmp[128];
        format(tmp, sizeof(tmp), "hud:%s", texto);
        format(texto, maxlen, "%s", tmp);
        return;
    }

    new lib[64], tex[64];
    new i = 0;
    for (; i < colon && i < sizeof(lib) - 1; i++) lib[i] = SAMSP_ToLower(texto[i]);
    lib[i] = EOS;

    new j = 0;
    for (i = colon + 1; texto[i] != EOS && j < sizeof(tex) - 1; i++, j++) tex[j] = SAMSP_ToLower(texto[i]);
    tex[j] = EOS;

    // Normalização de bibliotecas conhecidas do SA-MP
    if (!strcmp(lib, "loadscs", true))
    {
        format(lib, sizeof(lib), "LOADSCS");
    }
    else if (!strcmp(lib, "loadsuk", true))
    {
        format(lib, sizeof(lib), "LOADSUK");
    }
    else if (!strcmp(lib, "hud", true))
    {
        format(lib, sizeof(lib), "hud");
        // Correção de nomes específicos do hud.txd
        if (!strcmp(tex, "radar_ring", true) || !strcmp(tex, "radarringplane", true))
        {
            format(tex, sizeof(tex), "radarRingPlane");
        }
        else if (!strcmp(tex, "radar_zero", true)) format(tex, sizeof(tex), "radar_ZERO");
        else if (!strcmp(tex, "radar_woozie", true)) format(tex, sizeof(tex), "radar_WOOZIE");
        else if (!strcmp(tex, "radar_torenoranch", true)) format(tex, sizeof(tex), "radar_TorenoRanch");
        else if (!strcmp(tex, "radar_toreno", true)) format(tex, sizeof(tex), "radar_TORENO");
        else if (!strcmp(tex, "radar_thetruth", true)) format(tex, sizeof(tex), "radar_THETRUTH");
        else if (!strcmp(tex, "radar_sweet", true)) format(tex, sizeof(tex), "radar_SWEET");
        else if (!strcmp(tex, "radar_ryder", true)) format(tex, sizeof(tex), "radar_RYDER");
        else if (!strcmp(tex, "radar_ogloc", true)) format(tex, sizeof(tex), "radar_OGLOC");
        else if (!strcmp(tex, "radar_mcstrap", true)) format(tex, sizeof(tex), "radar_MCSTRAP");
        else if (!strcmp(tex, "radar_maddog", true)) format(tex, sizeof(tex), "radar_MADDOG");
        else if (!strcmp(tex, "radar_locosyndicate", true)) format(tex, sizeof(tex), "radar_LocoSyndicate");
        else if (!strcmp(tex, "radar_crash1", true)) format(tex, sizeof(tex), "radar_CRASH1");
        else if (!strcmp(tex, "radar_cj", true)) format(tex, sizeof(tex), "radar_CJ");
        else if (!strcmp(tex, "radar_cesarviapando", true)) format(tex, sizeof(tex), "radar_CESARVIAPANDO");
        else if (!strcmp(tex, "radar_catalinapink", true)) format(tex, sizeof(tex), "radar_CATALINAPINK");
        else if (!strcmp(tex, "radar_bigsmoke", true)) format(tex, sizeof(tex), "radar_BIGSMOKE");
        else if (!strcmp(tex, "radar_flag", true)) format(tex, sizeof(tex), "radar_Flag");
    }
    else if (lib[0] == 'l' && lib[1] == 'd' && lib[2] == '_')
    {
        for (new k = 0; lib[k] != EOS; k++) lib[k] = SAMSP_ToUpper(lib[k]);
    }

    format(texto, maxlen, "%s:%s", lib, tex);
}


stock SAMSP_CarregarMapa()
{
    new File:arquivo = fopen(SAMSP_ARQUIVO, io_read);
    if (!arquivo)
    {
        print("[SA Map Studio] Não encontrei " SAMSP_ARQUIVO);
        return 0;
    }
    new linha[1024], tipo[4], txd[64], textura[64], fonte[64], texto[900];
    new Float:sumX = 0.0, Float:sumY = 0.0, Float:sumZ = 0.0;
    new countCoords = 0;

    while (fread(arquivo, linha))
    {
        SAMSP_LimparLinha(linha);
        new pipePos = strfind(linha, "|");
        if (pipePos < 1 || pipePos > 3) continue;
        SAMSP_Campo(linha, 0, tipo, sizeof(tipo));
        switch (tipo[0])
        {
            case 'X':
            {
                gUseStreamer = (SAMSP_Int(linha, 1) != 0);
            }
            case 'S':
            {
                if (tipo[1] == 'N' && tipo[2] == 'D')
                {
                    if (gTotalSounds >= SAMSP_MAX_SOUNDS) continue;
                    gSounds[gTotalSounds][snd_id] = SAMSP_Int(linha, 1);
                    gSounds[gTotalSounds][snd_x] = SAMSP_Float(linha, 2);
                    gSounds[gTotalSounds][snd_y] = SAMSP_Float(linha, 3);
                    gSounds[gTotalSounds][snd_z] = SAMSP_Float(linha, 4);
                    sumX += gSounds[gTotalSounds][snd_x];
                    sumY += gSounds[gTotalSounds][snd_y];
                    sumZ += gSounds[gTotalSounds][snd_z];
                    countCoords++;
                    gTotalSounds++;
                    continue;
                }
                gSpawn[0] = SAMSP_Float(linha, 1);
                gSpawn[1] = SAMSP_Float(linha, 2);
                gSpawn[2] = SAMSP_Float(linha, 3);
                gSpawn[3] = SAMSP_Float(linha, 4);
                gSpawnInterior = SAMSP_Int(linha, 5);
                gSpawnMundo = SAMSP_Int(linha, 6);
                gJetpack = (SAMSP_Int(linha, 7) != 0);
            }
            case 'E':
            {
                gClima = SAMSP_Int(linha, 1);
                if (gClima < 0 || gClima > 45) gClima = 10;
                gHora = SAMSP_Int(linha, 2);
                if (gHora < 0 || gHora > 23) gHora = 10;
                gMinuto = SAMSP_Int(linha, 3);
                if (gMinuto < 0 || gMinuto > 59) gMinuto = 0;
            }
            case 'C':
            {
                if (tipo[1] == 'P')
                {
                    if (gTotalCheckpoints >= SAMSP_MAX_CHECKPOINTS) continue;
                    gCheckpoints[gTotalCheckpoints][cp_isRace] = (SAMSP_Int(linha, 1) != 0);
                    gCheckpoints[gTotalCheckpoints][cp_type] = SAMSP_Int(linha, 2);
                    gCheckpoints[gTotalCheckpoints][cp_x] = SAMSP_Float(linha, 3);
                    gCheckpoints[gTotalCheckpoints][cp_y] = SAMSP_Float(linha, 4);
                    gCheckpoints[gTotalCheckpoints][cp_z] = SAMSP_Float(linha, 5);
                    gCheckpoints[gTotalCheckpoints][cp_nx] = SAMSP_Float(linha, 6);
                    gCheckpoints[gTotalCheckpoints][cp_ny] = SAMSP_Float(linha, 7);
                    gCheckpoints[gTotalCheckpoints][cp_nz] = SAMSP_Float(linha, 8);
                    gCheckpoints[gTotalCheckpoints][cp_size] = SAMSP_Float(linha, 9);
                    if (gCheckpoints[gTotalCheckpoints][cp_size] <= 0.0)
                    {
                        gCheckpoints[gTotalCheckpoints][cp_size] = gCheckpoints[gTotalCheckpoints][cp_isRace] ? 4.0 : 3.0;
                    }
                    sumX += gCheckpoints[gTotalCheckpoints][cp_x];
                    sumY += gCheckpoints[gTotalCheckpoints][cp_y];
                    sumZ += gCheckpoints[gTotalCheckpoints][cp_z];
                    countCoords++;
                    gTotalCheckpoints++;
                    continue;
                }
                gMapCenter[0] = SAMSP_Float(linha, 1);
                gMapCenter[1] = SAMSP_Float(linha, 2);
                gMapCenter[2] = SAMSP_Float(linha, 3);
                gHasMapCenter = true;
            }
            case 'O':
            {
                if (gTotalObjetos >= SAMSP_MAX_OBJETOS)
                {
                    gIgnorados++;
                    continue;
                }
                new Float:ox = SAMSP_Float(linha, 2);
                new Float:oy = SAMSP_Float(linha, 3);
                new Float:oz = SAMSP_Float(linha, 4);
                new Float:orx = SAMSP_Float(linha, 5);
                new Float:ory = SAMSP_Float(linha, 6);
                new Float:orz = SAMSP_Float(linha, 7);
                new Float:odist = SAMSP_Float(linha, 8);
                if (odist <= 0.0) odist = 300.0;

                new id;
                if (gUseStreamer)
                {
                    id = _:CreateDynamicObject(SAMSP_Int(linha, 1), ox, oy, oz, orx, ory, orz, -1, -1, -1, (odist > 300.0 ? odist : 300.0), odist);
                }
                else
                {
                    id = CreateObject(SAMSP_Int(linha, 1), ox, oy, oz, orx, ory, orz, odist);
                }
                gObjetos[gTotalObjetos] = id;
                gTotalObjetos++;
                if (id == INVALID_OBJECT_ID || id == 0) gIgnorados++;

                sumX += ox;
                sumY += oy;
                sumZ += oz;
                countCoords++;
            }
            case 'M':
            {
                if (tipo[1] == 'I')
                {
                    if (gTotalMapIcons >= SAMSP_MAX_MAPICONS) continue;
                    gMapIcons[gTotalMapIcons][mi_iconid] = SAMSP_Int(linha, 1);
                    gMapIcons[gTotalMapIcons][mi_x] = SAMSP_Float(linha, 2);
                    gMapIcons[gTotalMapIcons][mi_y] = SAMSP_Float(linha, 3);
                    gMapIcons[gTotalMapIcons][mi_z] = SAMSP_Float(linha, 4);
                    gMapIcons[gTotalMapIcons][mi_type] = SAMSP_Int(linha, 5);
                    gMapIcons[gTotalMapIcons][mi_color] = SAMSP_HexOrInt(linha, 6);
                    gMapIcons[gTotalMapIcons][mi_style] = SAMSP_Int(linha, 7);
                    if (gUseStreamer && gTotalMapIcons >= 100)
                    {
                        CreateDynamicMapIcon(gMapIcons[gTotalMapIcons][mi_x], gMapIcons[gTotalMapIcons][mi_y], gMapIcons[gTotalMapIcons][mi_z],
                            gMapIcons[gTotalMapIcons][mi_type], gMapIcons[gTotalMapIcons][mi_color], -1, -1, -1, 200.0, gMapIcons[gTotalMapIcons][mi_style]);
                    }
                    sumX += gMapIcons[gTotalMapIcons][mi_x];
                    sumY += gMapIcons[gTotalMapIcons][mi_y];
                    sumZ += gMapIcons[gTotalMapIcons][mi_z];
                    countCoords++;
                    gTotalMapIcons++;
                    continue;
                }
                new indice = SAMSP_Int(linha, 1);
                if (indice < 0 || indice >= gTotalObjetos || gObjetos[indice] == INVALID_OBJECT_ID || gObjetos[indice] == 0) continue;
                SAMSP_Campo(linha, 4, txd, sizeof(txd));
                SAMSP_Campo(linha, 5, textura, sizeof(textura));
                if (gUseStreamer)
                {
                    SetDynamicObjectMaterial(STREAMER_TAG_OBJECT:gObjetos[indice], SAMSP_Int(linha, 2), SAMSP_Int(linha, 3), txd, textura, SAMSP_Int(linha, 6));
                }
                else
                {
                    SetObjectMaterial(gObjetos[indice], SAMSP_Int(linha, 2), SAMSP_Int(linha, 3), txd, textura, SAMSP_Int(linha, 6));
                }
            }
            case 'T':
            {
                new indice = SAMSP_Int(linha, 1);
                if (indice < 0 || indice >= gTotalObjetos || gObjetos[indice] == INVALID_OBJECT_ID || gObjetos[indice] == 0) continue;
                SAMSP_Campo(linha, 9, fonte, sizeof(fonte));
                SAMSP_Resto(linha, 10, texto, sizeof(texto));
                if (gUseStreamer)
                {
                    SetDynamicObjectMaterialText(STREAMER_TAG_OBJECT:gObjetos[indice], SAMSP_Int(linha, 2), texto, SAMSP_Int(linha, 3), fonte,
                        SAMSP_Int(linha, 4), bool:SAMSP_Int(linha, 5), SAMSP_Int(linha, 6), SAMSP_Int(linha, 7), SAMSP_Int(linha, 8));
                }
                else
                {
                    SetObjectMaterialText(gObjetos[indice], texto, SAMSP_Int(linha, 2), SAMSP_Int(linha, 3), fonte,
                        SAMSP_Int(linha, 4), bool:SAMSP_Int(linha, 5), SAMSP_Int(linha, 6), SAMSP_Int(linha, 7), SAMSP_Int(linha, 8));
                }
            }
            case 'R':
            {
                if (gTotalRemovidos >= SAMSP_MAX_REMOVIDOS) continue;
                gRemovidosModelo[gTotalRemovidos] = SAMSP_Int(linha, 1);
                gRemovidos[gTotalRemovidos][0] = SAMSP_Float(linha, 2);
                gRemovidos[gTotalRemovidos][1] = SAMSP_Float(linha, 3);
                gRemovidos[gTotalRemovidos][2] = SAMSP_Float(linha, 4);
                gRemovidos[gTotalRemovidos][3] = SAMSP_Float(linha, 5);
                gTotalRemovidos++;
            }
            case 'V':
            {
                if (tipo[1] == 'P')
                {
                    new vehIdx = SAMSP_Int(linha, 1);
                    new pj = SAMSP_Int(linha, 2);
                    if (vehIdx >= 0 && vehIdx < gTotalVeiculos && gVeiculos[vehIdx] != INVALID_VEHICLE_ID)
                    {
                        gVeiculoPaintjob[vehIdx] = pj;
                        ChangeVehiclePaintjob(gVeiculos[vehIdx], pj);
                    }
                    continue;
                }
                if (tipo[1] == 'C')
                {
                    new vehIdx = SAMSP_Int(linha, 1);
                    new compId = SAMSP_Int(linha, 2);
                    if (vehIdx >= 0 && vehIdx < gTotalVeiculos && gVeiculos[vehIdx] != INVALID_VEHICLE_ID)
                    {
                        if (gVeiculoTotalComps[vehIdx] < 16)
                        {
                            gVeiculoComps[vehIdx][gVeiculoTotalComps[vehIdx]] = compId;
                            gVeiculoTotalComps[vehIdx]++;
                        }
                        AddVehicleComponent(gVeiculos[vehIdx], compId);
                    }
                    continue;
                }
                if (gTotalVeiculos >= SAMSP_MAX_VEICULOS) continue;
                new Float:vx = SAMSP_Float(linha, 2);
                new Float:vy = SAMSP_Float(linha, 3);
                new Float:vz = SAMSP_Float(linha, 4);
                new veh = CreateVehicle(SAMSP_Int(linha, 1), vx, vy, vz,
                    SAMSP_Float(linha, 5), SAMSP_Int(linha, 6), SAMSP_Int(linha, 7), -1);
                gVeiculos[gTotalVeiculos] = veh;
                gVeiculoTotalComps[gTotalVeiculos] = 0;
                gVeiculoPaintjob[gTotalVeiculos] = -1;
                gTotalVeiculos++;

                sumX += vx;
                sumY += vy;
                sumZ += vz;
                countCoords++;
            }
            case 'A':
            {
                if (tipo[1] == 'V')
                {
                    new objIdx = SAMSP_Int(linha, 1);
                    new vehIdx = SAMSP_Int(linha, 2);
                    if (objIdx >= 0 && objIdx < gTotalObjetos && gObjetos[objIdx] != INVALID_OBJECT_ID && gObjetos[objIdx] != 0 &&
                        vehIdx >= 0 && vehIdx < gTotalVeiculos && gVeiculos[vehIdx] != INVALID_VEHICLE_ID)
                    {
                        new Float:aox = SAMSP_Float(linha, 3);
                        new Float:aoy = SAMSP_Float(linha, 4);
                        new Float:aoz = SAMSP_Float(linha, 5);
                        new Float:arx = SAMSP_Float(linha, 6);
                        new Float:ary = SAMSP_Float(linha, 7);
                        new Float:arz = SAMSP_Float(linha, 8);
                        if (gUseStreamer)
                        {
                            AttachDynamicObjectToVehicle(STREAMER_TAG_OBJECT:gObjetos[objIdx], gVeiculos[vehIdx], aox, aoy, aoz, arx, ary, arz);
                        }
                        else
                        {
                            AttachObjectToVehicle(gObjetos[objIdx], gVeiculos[vehIdx], aox, aoy, aoz, arx, ary, arz);
                        }
                    }
                    continue;
                }
                if (tipo[1] == 'O')
                {
                    new objIdx = SAMSP_Int(linha, 1);
                    new parIdx = SAMSP_Int(linha, 2);
                    if (objIdx >= 0 && objIdx < gTotalObjetos && gObjetos[objIdx] != INVALID_OBJECT_ID && gObjetos[objIdx] != 0 &&
                        parIdx >= 0 && parIdx < gTotalObjetos && gObjetos[parIdx] != INVALID_OBJECT_ID && gObjetos[parIdx] != 0)
                    {
                        new Float:aox = SAMSP_Float(linha, 3);
                        new Float:aoy = SAMSP_Float(linha, 4);
                        new Float:aoz = SAMSP_Float(linha, 5);
                        new Float:arx = SAMSP_Float(linha, 6);
                        new Float:ary = SAMSP_Float(linha, 7);
                        new Float:arz = SAMSP_Float(linha, 8);
                        new syncRot = SAMSP_Int(linha, 9);
                        if (gUseStreamer)
                        {
                            AttachDynamicObjectToObject(STREAMER_TAG_OBJECT:gObjetos[objIdx], gObjetos[parIdx], aox, aoy, aoz, arx, ary, arz, syncRot);
                        }
                        else
                        {
                            AttachObjectToObject(gObjetos[objIdx], gObjetos[parIdx], aox, aoy, aoz, arx, ary, arz, bool:syncRot);
                        }
                    }
                    continue;
                }
                if (gTotalActors >= SAMSP_MAX_ACTORS) continue;
                new skin = SAMSP_Int(linha, 1);
                new Float:ax = SAMSP_Float(linha, 2);
                new Float:ay = SAMSP_Float(linha, 3);
                new Float:az = SAMSP_Float(linha, 4);
                new Float:aa = SAMSP_Float(linha, 5);
                new actorid = CreateActor(skin, ax, ay, az, aa);
                if (actorid != INVALID_ACTOR_ID)
                {
                    new world = SAMSP_Int(linha, 6);
                    if (world != 0) SetActorVirtualWorld(actorid, world);
                    new inv = SAMSP_Int(linha, 7);
                    if (inv != 0) SetActorInvulnerable(actorid, true);
                    new animLib[32], animName[32];
                    SAMSP_Campo(linha, 8, animLib, sizeof(animLib));
                    SAMSP_Campo(linha, 9, animName, sizeof(animName));
                    if (animLib[0] != EOS && animName[0] != EOS)
                    {
                        new Float:delta = SAMSP_Float(linha, 10);
                        if (delta <= 0.0) delta = 4.1;
                        new loop = SAMSP_Int(linha, 11);
                        new lockx = SAMSP_Int(linha, 12);
                        new locky = SAMSP_Int(linha, 13);
                        new freeze = SAMSP_Int(linha, 14);
                        new time = SAMSP_Int(linha, 15);

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
            case 'L':
            {
                if (gTotalLabels >= SAMSP_MAX_LABELS) continue;
                new Float:lx = SAMSP_Float(linha, 1);
                new Float:ly = SAMSP_Float(linha, 2);
                new Float:lz = SAMSP_Float(linha, 3);
                new Float:ldist = SAMSP_Float(linha, 4);
                if (ldist <= 0.0) ldist = 50.0;
                new lcolor = SAMSP_HexOrInt(linha, 5);
                new lworld = SAMSP_Int(linha, 6);
                new ltestlos = SAMSP_Int(linha, 7);
                SAMSP_Resto(linha, 8, texto, sizeof(texto));
                if (gUseStreamer)
                {
                    new Text3D:lbl = Text3D:CreateDynamic3DTextLabel(texto, lcolor, lx, ly, lz, ldist, INVALID_PLAYER_ID, INVALID_VEHICLE_ID, ltestlos, lworld);
                    gLabels[gTotalLabels] = lbl;
                }
                else
                {
                    new Text3D:lbl = Create3DTextLabel(texto, lcolor, lx, ly, lz, ldist, lworld, bool:ltestlos);
                    gLabels[gTotalLabels] = lbl;
                }
                gTotalLabels++;
                sumX += lx;
                sumY += ly;
                sumZ += lz;
                countCoords++;
            }
            case 'P':
            {
                if (gTotalPickups >= SAMSP_MAX_PICKUPS) continue;
                new pmodel = SAMSP_Int(linha, 1);
                new ptype = SAMSP_Int(linha, 2);
                if (ptype <= 0) ptype = 1;
                new Float:px = SAMSP_Float(linha, 3);
                new Float:py = SAMSP_Float(linha, 4);
                new Float:pz = SAMSP_Float(linha, 5);
                new pworld = SAMSP_Int(linha, 6);
                if (gUseStreamer)
                {
                    new pick = _:CreateDynamicPickup(pmodel, ptype, px, py, pz, pworld);
                    gPickups[gTotalPickups] = pick;
                }
                else
                {
                    new pick = CreatePickup(pmodel, ptype, px, py, pz, pworld);
                    gPickups[gTotalPickups] = pick;
                }
                gTotalPickups++;
                sumX += px;
                sumY += py;
                sumZ += pz;
                countCoords++;
            }
            case 'G':
            {
                if (gTotalGangZones >= SAMSP_MAX_GANGZONES) continue;
                new Float:gminx = SAMSP_Float(linha, 1);
                new Float:gminy = SAMSP_Float(linha, 2);
                new Float:gmaxx = SAMSP_Float(linha, 3);
                new Float:maxy = SAMSP_Float(linha, 4);
                new gcolor = SAMSP_HexOrInt(linha, 5);
                new gz = GangZoneCreate(gminx, gminy, gmaxx, maxy);
                if (gz != -1)
                {
                    gGangZones[gTotalGangZones] = gz;
                    gGangZoneColors[gTotalGangZones] = gcolor;
                    gTotalGangZones++;
                }
            }
            case 'D':
            {
                if (gTotalTextDraws >= SAMSP_MAX_TEXTDRAWS) continue;
                new Float:tdx = SAMSP_Float(linha, 1);
                new Float:tdy = SAMSP_Float(linha, 2);
                new tdfont = SAMSP_Int(linha, 3);
                new Float:tdletx = SAMSP_Float(linha, 4);
                new Float:tdlety = SAMSP_Float(linha, 5);
                new Float:tdsizex = SAMSP_Float(linha, 6);
                new Float:tdsizey = SAMSP_Float(linha, 7);
                new tdcol = SAMSP_HexOrInt(linha, 8);
                new tdboxcol = SAMSP_HexOrInt(linha, 9);
                new tdbgcol = SAMSP_HexOrInt(linha, 10);
                new tdoutline = SAMSP_Int(linha, 11);
                new tdshadow = SAMSP_Int(linha, 12);
                new tdalign = SAMSP_Int(linha, 13);
                new tdusebox = SAMSP_Int(linha, 14);
                new tdprop = SAMSP_Int(linha, 15);
                new tdselect = SAMSP_Int(linha, 16);
                new tdmodel = SAMSP_Int(linha, 17);
                new Float:tdrotx = SAMSP_Float(linha, 18);
                new Float:tdroty = SAMSP_Float(linha, 19);
                new Float:tdrotz = SAMSP_Float(linha, 20);
                new Float:tdzoom = SAMSP_Float(linha, 21);
                SAMSP_Resto(linha, 22, texto, sizeof(texto));

                if (tdfont == 4)
                {
                    SAMSP_NormalizeSprite(texto, sizeof(texto));
                    new Text:td = TextDrawCreate(tdx, tdy, texto);
                    if (td != Text:INVALID_TEXT_DRAW)
                    {
                        TextDrawFont(td, 4);
                        TextDrawLetterSize(td, 0.0, 0.0);
                        TextDrawTextSize(td, (tdsizex > 0.0 ? tdsizex : 64.0), (tdsizey > 0.0 ? tdsizey : 64.0));
                        if (tdcol == 0 || tdcol == 0xFF) tdcol = 0xFFFFFFFF;
                        if ((tdcol & 0xFF) == 0) tdcol |= 0xFF;
                        TextDrawColor(td, tdcol);
                        TextDrawBackgroundColor(td, (tdbgcol & 0xFF) == 0 ? 0x000000FF : tdbgcol);
                        TextDrawAlignment(td, 1);
                        TextDrawSetOutline(td, 0);
                        TextDrawSetShadow(td, 0);
                        TextDrawSetProportional(td, true);
                        TextDrawUseBox(td, false);
                        if (tdselect) TextDrawSetSelectable(td, true);
                        gTextDraws[gTotalTextDraws] = td;
                        gTotalTextDraws++;
                    }
                }
                else if (tdfont == 5)
                {
                    new Text:td = TextDrawCreate(tdx, tdy, "_");
                    if (td != Text:INVALID_TEXT_DRAW)
                    {
                        TextDrawFont(td, 5);
                        TextDrawLetterSize(td, 0.0, 0.0);
                        TextDrawTextSize(td, (tdsizex > 0.0 ? tdsizex : 80.0), (tdsizey > 0.0 ? tdsizey : 80.0));
                        TextDrawColor(td, tdcol);
                        TextDrawSetOutline(td, 0);
                        TextDrawSetShadow(td, 0);
                        TextDrawAlignment(td, (tdalign > 0 ? tdalign : 1));
                        if (tdusebox)
                        {
                            TextDrawUseBox(td, true);
                            TextDrawBoxColor(td, tdboxcol);
                        }
                        TextDrawBackgroundColor(td, tdbgcol);
                        TextDrawSetProportional(td, bool:tdprop);
                        if (tdselect) TextDrawSetSelectable(td, true);
                        if (tdmodel > 0)
                        {
                            TextDrawSetPreviewModel(td, tdmodel);
                            TextDrawSetPreviewRot(td, tdrotx, tdroty, tdrotz, (tdzoom > 0.0 ? tdzoom : 1.0));
                            TextDrawSetPreviewVehCol(td, 1, 1);
                        }
                        gTextDraws[gTotalTextDraws] = td;
                        gTotalTextDraws++;
                    }
                }
                else
                {
                    new Text:td = TextDrawCreate(tdx, tdy, texto[0] != EOS ? texto : "_");
                    if (td != Text:INVALID_TEXT_DRAW)
                    {
                        TextDrawFont(td, tdfont);
                        TextDrawLetterSize(td, (tdletx >= 0.0 ? tdletx : 0.35), (tdlety > 0.0 ? tdlety : 1.40));
                        TextDrawAlignment(td, (tdalign > 0 ? tdalign : 1));
                        TextDrawColor(td, tdcol);
                        TextDrawSetOutline(td, tdoutline);
                        TextDrawSetShadow(td, tdshadow);
                        TextDrawSetProportional(td, bool:tdprop);
                        if (tdusebox)
                        {
                            TextDrawUseBox(td, true);
                            TextDrawBoxColor(td, tdboxcol);
                            TextDrawTextSize(td, tdsizex, tdsizey);
                        }
                        else
                        {
                            new Float:wrapX = (tdalign == 3) ? 0.0 : (tdsizex > 0.0 ? tdsizex : 640.0);
                            new Float:wrapY = (tdalign == 2) ? (tdsizey > 0.0 ? tdsizey : 640.0) : 480.0;
                            TextDrawTextSize(td, wrapX, wrapY);
                        }
                        TextDrawBackgroundColor(td, tdbgcol);
                        if (tdselect) TextDrawSetSelectable(td, true);
                        gTextDraws[gTotalTextDraws] = td;
                        gTotalTextDraws++;
                    }
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

    if (gSpawn[0] == 0.0 && gSpawn[1] == 0.0 && (gSpawn[2] == 0.0 || gSpawn[2] == 3.0) && gHasMapCenter)
    {
        gSpawn[0] = gMapCenter[0];
        gSpawn[1] = gMapCenter[1];
        gSpawn[2] = gMapCenter[2];
        gSpawn[3] = 0.0;
    }

    printf("[SA Map Studio] %d objetos, %d prédios removidos, %d veículos, %d actors, %d labels, %d pickups, %d gangzones, %d checkpoints, %d mapicons, %d sons, %d textdraws (Streamer: %s)",
        gTotalObjetos, gTotalRemovidos, gTotalVeiculos, gTotalActors, gTotalLabels, gTotalPickups, gTotalGangZones, gTotalCheckpoints, gTotalMapIcons, gTotalSounds, gTotalTextDraws, gUseStreamer ? "ATIVO" : "DESATIVADO");
    printf("[SA Map Studio] Clima: %d, Horário: %02d:%02d, Centro do mapa: %.2f, %.2f, %.2f", gClima, gHora, gMinuto, gMapCenter[0], gMapCenter[1], gMapCenter[2]);
    return 1;
}

public OnGameModeInit()
{
    SetGameModeText("SA Map Studio");
    UsePlayerPedAnims();
    DisableInteriorEnterExits();
    ShowPlayerMarkers(PLAYER_MARKERS_MODE_OFF);
    SAMSP_CarregarMapa();
    AddPlayerClass(0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    SetWorldTime(gHora);
    SetWeather(gClima);
    return 1;
}

// Tabela com todas as 135 bibliotecas de animacao oficiais do GTA SA / open.mp para pre-carregamento completo
static const gPreloadAnimLibs[][] = {
    "AIRPORT", "Attractors", "BAR", "BASEBALL", "BD_FIRE", "BEACH", "benchpress", "BF_injection",
    "BIKED", "BIKEH", "BIKELEAP", "BIKES", "BIKEV", "BIKE_DBZ", "BLOWJOBZ", "BMX",
    "BOMBER", "BOX", "BSKTBALL", "BUDDY", "BUS", "CAMERA", "CAR", "CARRY",
    "CAR_CHAT", "CASINO", "CHAINSAW", "CHOPPA", "CLOTHES", "COACH", "COLT45", "COP_AMBIENT",
    "COP_DVBYZ", "CRACK", "CRIB", "DAM_JUMP", "DANCING", "DEALER", "DILDO", "DODGE",
    "DOZER", "DRIVEBYS", "FAT", "FIGHT_B", "FIGHT_C", "FIGHT_D", "FIGHT_E", "FINALE",
    "FINALE2", "FLAME", "Flowers", "FOOD", "Freeweights", "GANGS", "GFUNK", "GHANDS",
    "GHETTO_DB", "goggles", "GRAFFITI", "GRAVEYARD", "GRENADE", "GYMNASIUM", "HAIRCUTS", "HEIST9",
    "INT_HOUSE", "INT_OFFICE", "INT_SHOP", "JST_BUISNESS", "KART", "KISSING", "KNIFE", "LAPDAN1",
    "LAPDAN2", "LAPDAN3", "LOWRIDER", "MD_CHASE", "MD_END", "MEDIC", "MISC", "MTB",
    "MUSCULAR", "NEVADA", "ON_LOOKERS", "OTB", "PARACHUTE", "PARK", "PAULNMAC", "ped",
    "PLAYER_DVBYS", "PLAYIDLES", "POLICE", "POOL", "POOR", "PYTHON", "QUAD", "QUAD_DBZ",
    "RAPPING", "RIFLE", "RIOT", "ROB_BANK", "ROCKET", "RUNNINGMAN", "RUSTLER", "RYDER",
    "SAMP", "SCRATCHING", "SEX", "SHAMAL", "SHOP", "SHOTGUN", "SILENCED", "SKATE",
    "SMOKING", "SNIPER", "SnM", "SPRAYCAN", "STRIP", "SUNBATHE", "SWAT", "SWEET",
    "SWIM", "SWORD", "TANK", "TATTOOS", "TEC", "TRAIN", "TRUCK", "UZI",
    "VAN", "VENDING", "VORTEX", "WAYFARER", "WEAPONS", "WOP", "WUZI"
};

// Pre-carrega todas as bibliotecas IFP no cliente do jogador
stock SAMSP_PreloadAllAnims(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    for (new i = 0; i < sizeof(gPreloadAnimLibs); i++)
    {
        ApplyAnimation(playerid, gPreloadAnimLibs[i], "null", 0.0, false, false, false, false, 0);
    }
    for (new i = 0; i < gTotalAnimLibs; i++)
    {
        ApplyAnimation(playerid, gAnimLibs[i], "null", 0.0, false, false, false, false, 0);
    }
    return 1;
}

// Sincroniza e reaplica as animações de todos os actors para o jogador
forward SAMSP_SyncActorAnims(playerid);
public SAMSP_SyncActorAnims(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    SAMSP_PreloadAllAnims(playerid);
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

// Quando um actor entra na área visível (stream-in) de um jogador, assegura a animação ativa
public OnVehicleStreamIn(vehicleid, forplayerid)
{
    #pragma unused forplayerid
    for (new i = 0; i < gTotalVeiculos; i++)
    {
        if (gVeiculos[i] == vehicleid)
        {
            if (gVeiculoPaintjob[i] >= 0)
            {
                ChangeVehiclePaintjob(vehicleid, gVeiculoPaintjob[i]);
            }
            for (new c = 0; c < gVeiculoTotalComps[i]; c++)
            {
                AddVehicleComponent(vehicleid, gVeiculoComps[i][c]);
            }
            break;
        }
    }
    return 1;
}

stock SAMSP_ApplyAllVehicleTuning()
{
    for (new i = 0; i < gTotalVeiculos; i++)
    {
        new veh = gVeiculos[i];
        if (veh != INVALID_VEHICLE_ID)
        {
            if (gVeiculoPaintjob[i] >= 0)
            {
                ChangeVehiclePaintjob(veh, gVeiculoPaintjob[i]);
            }
            for (new c = 0; c < gVeiculoTotalComps[i]; c++)
            {
                AddVehicleComponent(veh, gVeiculoComps[i][c]);
            }
        }
    }
}

forward SAMSP_DelayedVehicleTuning();
public SAMSP_DelayedVehicleTuning()
{
    SAMSP_ApplyAllVehicleTuning();
    return 1;
}

public OnVehicleSpawn(vehicleid)
{
    for (new i = 0; i < gTotalVeiculos; i++)
    {
        if (gVeiculos[i] == vehicleid)
        {
            if (gVeiculoPaintjob[i] >= 0)
            {
                ChangeVehiclePaintjob(vehicleid, gVeiculoPaintjob[i]);
            }
            for (new c = 0; c < gVeiculoTotalComps[i]; c++)
            {
                AddVehicleComponent(vehicleid, gVeiculoComps[i][c]);
            }
            break;
        }
    }
    return 1;
}

public OnPlayerStateChange(playerid, newstate, oldstate)
{
    if (newstate == PLAYER_STATE_DRIVER || newstate == PLAYER_STATE_PASSENGER)
    {
        new veh = GetPlayerVehicleID(playerid);
        if (veh != 0 && veh != INVALID_VEHICLE_ID)
        {
            for (new i = 0; i < gTotalVeiculos; i++)
            {
                if (gVeiculos[i] == veh)
                {
                    if (gVeiculoPaintjob[i] >= 0)
                    {
                        ChangeVehiclePaintjob(veh, gVeiculoPaintjob[i]);
                    }
                    for (new c = 0; c < gVeiculoTotalComps[i]; c++)
                    {
                        AddVehicleComponent(veh, gVeiculoComps[i][c]);
                    }
                    break;
                }
            }
        }
    }
    return 1;
}

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

stock SAMSP_ShowMapIcons(playerid)
{
    for (new i = 0; i < gTotalMapIcons && i < 100; i++)
    {
        new slot = gMapIcons[i][mi_iconid];
        if (slot < 0 || slot >= 100) slot = i;
        SetPlayerMapIcon(playerid, slot, gMapIcons[i][mi_x], gMapIcons[i][mi_y], gMapIcons[i][mi_z],
            gMapIcons[i][mi_type], gMapIcons[i][mi_color], MAPICON:gMapIcons[i][mi_style]);
    }
}

stock SAMSP_ShowPlayerCheckpoints(playerid)
{
    if (gTotalCheckpoints <= 0) return;
    new normIdx = gPlayerNormalCPIdx[playerid];
    new raceIdx = gPlayerRaceCPIdx[playerid];

    new foundNorm = -1;
    for (new i = 0; i < gTotalCheckpoints; i++)
    {
        new idx = (normIdx + i) % gTotalCheckpoints;
        if (!gCheckpoints[idx][cp_isRace])
        {
            foundNorm = idx;
            break;
        }
    }
    if (foundNorm != -1)
    {
        gPlayerNormalCPIdx[playerid] = foundNorm;
        SetPlayerCheckpoint(playerid, gCheckpoints[foundNorm][cp_x], gCheckpoints[foundNorm][cp_y], gCheckpoints[foundNorm][cp_z], gCheckpoints[foundNorm][cp_size]);
    }

    new foundRace = -1;
    for (new i = 0; i < gTotalCheckpoints; i++)
    {
        new idx = (raceIdx + i) % gTotalCheckpoints;
        if (gCheckpoints[idx][cp_isRace])
        {
            foundRace = idx;
            break;
        }
    }
    if (foundRace != -1)
    {
        gPlayerRaceCPIdx[playerid] = foundRace;
        SetPlayerRaceCheckpoint(playerid, CP_TYPE:gCheckpoints[foundRace][cp_type],
            gCheckpoints[foundRace][cp_x], gCheckpoints[foundRace][cp_y], gCheckpoints[foundRace][cp_z],
            gCheckpoints[foundRace][cp_nx], gCheckpoints[foundRace][cp_ny], gCheckpoints[foundRace][cp_nz],
            gCheckpoints[foundRace][cp_size]);
    }
}

stock SAMSP_PlayMapSounds(playerid)
{
    for (new i = 0; i < gTotalSounds; i++)
    {
        PlayerPlaySound(playerid, gSounds[i][snd_id], gSounds[i][snd_x], gSounds[i][snd_y], gSounds[i][snd_z]);
    }
}

public OnPlayerEnterCheckpoint(playerid)
{
    if (gTotalCheckpoints <= 0) return 1;
    new countNorm = 0;
    for (new i = 0; i < gTotalCheckpoints; i++)
    {
        if (!gCheckpoints[i][cp_isRace]) countNorm++;
    }
    if (countNorm > 1)
    {
        gPlayerNormalCPIdx[playerid] = (gPlayerNormalCPIdx[playerid] + 1) % gTotalCheckpoints;
        SAMSP_ShowPlayerCheckpoints(playerid);
    }
    PlayerPlaySound(playerid, 1058, 0.0, 0.0, 0.0);
    return 1;
}

public OnPlayerEnterRaceCheckpoint(playerid)
{
    if (gTotalCheckpoints <= 0) return 1;
    new countRace = 0;
    for (new i = 0; i < gTotalCheckpoints; i++)
    {
        if (gCheckpoints[i][cp_isRace]) countRace++;
    }
    if (countRace > 1)
    {
        gPlayerRaceCPIdx[playerid] = (gPlayerRaceCPIdx[playerid] + 1) % gTotalCheckpoints;
        SAMSP_ShowPlayerCheckpoints(playerid);
    }
    PlayerPlaySound(playerid, 1138, 0.0, 0.0, 0.0);
    return 1;
}

public OnPlayerConnect(playerid)
{
    gPlayerSpawned[playerid] = false;
    gNoClip[playerid][noclip_cameramode] = CAMERA_MODE_NONE;
    gNoClip[playerid][noclip_flyobject] = INVALID_OBJECT_ID;
    gNoClip[playerid][noclip_lrold] = 0;
    gNoClip[playerid][noclip_udold] = 0;
    gNoClip[playerid][noclip_mode] = 0;
    gNoClip[playerid][noclip_lastmove] = 0;
    gNoClip[playerid][noclip_accelmul] = 0.0;
    gReturningFromFly[playerid] = false;

    SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    SetPlayerTime(playerid, gHora, gMinuto);
    SetPlayerWeather(playerid, gClima);

    for (new i = 0; i < gTotalRemovidos; i++)
    {
        RemoveBuildingForPlayer(playerid, gRemovidosModelo[i], gRemovidos[i][0], gRemovidos[i][1], gRemovidos[i][2], gRemovidos[i][3]);
    }
    for (new i = 0; i < gTotalGangZones; i++)
    {
        GangZoneShowForPlayer(playerid, gGangZones[i], gGangZoneColors[i]);
    }
    gPlayerNormalCPIdx[playerid] = 0;
    gPlayerRaceCPIdx[playerid] = 0;
    for (new i = 0; i < gTotalTextDraws; i++)
    {
        TextDrawShowForPlayer(playerid, gTextDraws[i]);
    }
    SAMSP_ShowMapIcons(playerid);
    SAMSP_PreloadAllAnims(playerid);
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
    gPlayerSpawned[playerid] = false;
    return 1;
}

// Pula a escolha de personagem: no open.mp e SA-MP, chama SetSpawnInfo e SpawnPlayer diretamente
public OnPlayerRequestClass(playerid, classid)
{
    SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    SpawnPlayer(playerid);
    SetTimerEx("SAMSP_Spawnar", 150, false, "i", playerid);
    return 1;
}

forward SAMSP_Spawnar(playerid);
public SAMSP_Spawnar(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    if (!gPlayerSpawned[playerid])
    {
        SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
        SpawnPlayer(playerid);
    }
    return 1;
}

public OnPlayerRequestSpawn(playerid)
{
    SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    return 1;
}

public OnPlayerDeath(playerid, killerid, reason)
{
    gPlayerSpawned[playerid] = false;
    SetSpawnInfo(playerid, NO_TEAM, 0, gSpawn[0], gSpawn[1], gSpawn[2], gSpawn[3], 0, 0, 0, 0, 0, 0);
    return 1;
}

stock SAMSP_IrParaSpawn(playerid)
{
    SetPlayerInterior(playerid, gSpawnInterior);
    SetPlayerVirtualWorld(playerid, gSpawnMundo);
    SetPlayerPos(playerid, gSpawn[0], gSpawn[1], gSpawn[2]);
    SetPlayerFacingAngle(playerid, gSpawn[3]);
    SetCameraBehindPlayer(playerid);
    if (gJetpack) SetPlayerSpecialAction(playerid, SPECIAL_ACTION_USEJETPACK);
}

forward SAMSP_ShowAllTextDraws(playerid);
public SAMSP_ShowAllTextDraws(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    for (new i = 0; i < gTotalTextDraws; i++)
    {
        TextDrawHideForPlayer(playerid, gTextDraws[i]);
        TextDrawShowForPlayer(playerid, gTextDraws[i]);
    }
    return 1;
}

public OnPlayerSpawn(playerid)
{
    gPlayerSpawned[playerid] = true;
    if (gReturningFromFly[playerid])
    {
        SAMSP_RestaurarPosVoo(playerid);
        return 1;
    }

    SAMSP_IrParaSpawn(playerid);
    SetPlayerTime(playerid, gHora, gMinuto);
    SetPlayerWeather(playerid, gClima);
    if (gUseStreamer)
    {
        Streamer_Update(playerid);
    }
    for (new i = 0; i < gTotalGangZones; i++)
    {
        GangZoneShowForPlayer(playerid, gGangZones[i], gGangZoneColors[i]);
    }
    SAMSP_ShowMapIcons(playerid);
    SAMSP_ShowPlayerCheckpoints(playerid);
    SAMSP_PlayMapSounds(playerid);
    SAMSP_ShowAllTextDraws(playerid);
    SAMSP_ApplyAllVehicleTuning();
    SetTimer("SAMSP_DelayedVehicleTuning", 300, false);
    SetTimer("SAMSP_DelayedVehicleTuning", 800, false);
    SetTimer("SAMSP_DelayedVehicleTuning", 2000, false);
    SetTimerEx("SAMSP_ShowAllTextDraws", 400, false, "i", playerid);
    SetTimerEx("SAMSP_ShowAllTextDraws", 1200, false, "i", playerid);
    SAMSP_PreloadAllAnims(playerid);
    SetTimerEx("SAMSP_SyncActorAnims", 500, false, "i", playerid);
    SetTimerEx("SAMSP_SyncActorAnims", 1500, false, "i", playerid);
    SendClientMessage(playerid, SAMSP_COR_INFO, "SA Map Studio: teste do mapa.");
    SendClientMessage(playerid, SAMSP_COR_OK, "Comandos: /fly (/voar)  /map (/mapa)  /w [clima]  /t [hora]  /anim  /jetpack  /v [modelo]  /spawn  /pos");
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

    SendClientMessage(playerid, SAMSP_COR_OK, "Modo de voo livre ativado! W/S/A/D para mover, mouse para olhar. Digite /fly ou /voar para sair.");
    return 1;
}

stock CancelarFlyMode(playerid)
{
    if (gNoClip[playerid][noclip_cameramode] != CAMERA_MODE_FLY) return 0;
    DestroyPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);
    gNoClip[playerid][noclip_cameramode] = CAMERA_MODE_NONE;
    gReturningFromFly[playerid] = true;
    TogglePlayerSpectating(playerid, false);
    SetTimerEx("SAMSP_RestaurarPosVoo", 150, false, "i", playerid);
    return 1;
}

forward SAMSP_RestaurarPosVoo(playerid);
public SAMSP_RestaurarPosVoo(playerid)
{
    if (!IsPlayerConnected(playerid)) return 0;
    SetPlayerInterior(playerid, gFlySavedInterior[playerid]);
    SetPlayerVirtualWorld(playerid, gFlySavedWorld[playerid]);
    SetPlayerPos(playerid, gFlySavedPos[playerid][0], gFlySavedPos[playerid][1], gFlySavedPos[playerid][2]);
    SetPlayerFacingAngle(playerid, gFlySavedPos[playerid][3]);
    SetCameraBehindPlayer(playerid);
    gReturningFromFly[playerid] = false;
    SetTimerEx("SAMSP_SyncActorAnims", 500, false, "i", playerid);
    SetTimerEx("SAMSP_ShowAllTextDraws", 300, false, "i", playerid);
    SendClientMessage(playerid, SAMSP_COR_INFO, "Modo de voo desativado. Você retornou à posição onde o voo foi ativado.");
    return 1;
}

public OnPlayerCommandText(playerid, cmdtext[])
{
    // Ativa / Desativa o modo voo da câmera
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

    // Sincroniza e reaplica animações dos actors
    if (!strcmp(cmdtext, "/anim", true) || !strcmp(cmdtext, "/reanim", true) || !strcmp(cmdtext, "/animar", true))
    {
        SAMSP_SyncActorAnims(playerid);
        SendClientMessage(playerid, SAMSP_COR_OK, "Animações dos actors sincronizadas e reaplicadas.");
        return 1;
    }

    // Teleporta para o centro do mapa
    if (!strcmp(cmdtext, "/map", true) || !strcmp(cmdtext, "/mapa", true))
    {
        if (gNoClip[playerid][noclip_cameramode] == CAMERA_MODE_FLY)
        {
            StopPlayerObject(playerid, gNoClip[playerid][noclip_flyobject]);
            SetPlayerObjectPos(playerid, gNoClip[playerid][noclip_flyobject], gMapCenter[0], gMapCenter[1], gMapCenter[2]);
            SendClientMessage(playerid, SAMSP_COR_OK, "Câmera teleportada para o centro do mapa.");
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
        SendClientMessage(playerid, SAMSP_COR_OK, "Teleportado para o centro do mapa em teste.");
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
        SAMSP_IrParaSpawn(playerid);
        return 1;
    }
    if (!strcmp(cmdtext, "/pos", true))
    {
        new Float:x, Float:y, Float:z, Float:a, msg[128];
        GetPlayerPos(playerid, x, y, z);
        GetPlayerFacingAngle(playerid, a);
        format(msg, sizeof(msg), "Posição: %.4f, %.4f, %.4f  Ângulo: %.1f  Interior: %d", x, y, z, a, GetPlayerInterior(playerid));
        SendClientMessage(playerid, SAMSP_COR_OK, msg);
        printf("[SA Map Studio] %s", msg);
        return 1;
    }
    if (!strcmp(cmdtext, "/v", true, 2) && (cmdtext[2] == ' ' || cmdtext[2] == EOS))
    {
        new modelo = (cmdtext[2] == ' ') ? strval(cmdtext[3]) : 411;
        if (modelo < 400 || modelo > 611)
        {
            SendClientMessage(playerid, SAMSP_COR_INFO, "Use /v [modelo], de 400 a 611.");
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
            SendClientMessage(playerid, SAMSP_COR_INFO, msg);
            return 1;
        }

        new novoClima = strval(cmdtext[paramIdx]);
        if (novoClima < 0 || novoClima > 255)
        {
            SendClientMessage(playerid, SAMSP_COR_INFO, "ID de clima inválido! Escolha um valor entre 0 e 45.");
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
        SendClientMessage(playerid, SAMSP_COR_OK, msg);
        printf("[SA Map Studio] Clima alterado para %d por player %d.", gClima, playerid);
        return 1;
    }

    // Altera o horário do servidor e jogadores (/t [hora] [minuto], /time, /hora, /tempo)
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
            format(msg, sizeof(msg), "Uso: /t [0-23] [minutos] ou /t HH:MM (ex: /t 12 ou /t 22:30) - Horário atual: %02d:%02d", gHora, gMinuto);
            SendClientMessage(playerid, SAMSP_COR_INFO, msg);
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
            SendClientMessage(playerid, SAMSP_COR_INFO, "Horário inválido! Use hora de 0 a 23 e minutos de 0 a 59 (ex: /t 14 ou /t 14:30).");
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
        format(msg, sizeof(msg), "Horário alterado para %02d:%02d.", gHora, gMinuto);
        SendClientMessage(playerid, SAMSP_COR_OK, msg);
        printf("[SA Map Studio] Horário alterado para %02d:%02d por player %d.", gHora, gMinuto, playerid);
        return 1;
    }

    // Reproduzir sons do mapa ou testar um Sound ID (/som [id])
    if ((!strcmp(cmdtext, "/som", true, 4) && (cmdtext[4] == ' ' || cmdtext[4] == EOS)) ||
        (!strcmp(cmdtext, "/sound", true, 6) && (cmdtext[6] == ' ' || cmdtext[6] == EOS)))
    {
        new pIdx = (!strcmp(cmdtext, "/som", true, 4)) ? 4 : 6;
        while (cmdtext[pIdx] == ' ') pIdx++;
        if (cmdtext[pIdx] != EOS)
        {
            new sid = strval(cmdtext[pIdx]);
            PlayerPlaySound(playerid, sid, 0.0, 0.0, 0.0);
            new msg[96];
            format(msg, sizeof(msg), "Reproduzindo Sound ID %d.", sid);
            SendClientMessage(playerid, SAMSP_COR_OK, msg);
            return 1;
        }
        if (gTotalSounds > 0)
        {
            SAMSP_PlayMapSounds(playerid);
            SendClientMessage(playerid, SAMSP_COR_OK, "Sons do mapa reproduzidos.");
        }
        else
        {
            SendClientMessage(playerid, SAMSP_COR_INFO, "Use /som [soundid] para testar um som (ex: /som 1052).");
        }
        return 1;
    }

    // Avançar ou teleportar para Checkpoints do mapa (/cp)
    if (!strcmp(cmdtext, "/cp", true))
    {
        if (gTotalCheckpoints <= 0)
        {
            SendClientMessage(playerid, SAMSP_COR_INFO, "Nenhum checkpoint no mapa atual.");
            return 1;
        }
        new idx = gPlayerRaceCPIdx[playerid];
        if (!gCheckpoints[idx][cp_isRace]) idx = gPlayerNormalCPIdx[playerid];
        SetPlayerPos(playerid, gCheckpoints[idx][cp_x], gCheckpoints[idx][cp_y], gCheckpoints[idx][cp_z] + 1.0);
        SendClientMessage(playerid, SAMSP_COR_OK, "Teleportado para o checkpoint atual.");
        return 1;
    }

    // Ajuda e lista de comandos
    if (!strcmp(cmdtext, "/ajuda", true) || !strcmp(cmdtext, "/help", true) || !strcmp(cmdtext, "/comandos", true))
    {
        SendClientMessage(playerid, SAMSP_COR_INFO, "Comandos do servidor de teste:");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /fly (/voar) - Alternar voo livre da câmera");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /map (/mapa) - Teleportar ao centro do mapa em teste");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /w [0-45] - Alterar clima (ex: /w 10)");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /t [0-23] [min] - Alterar horário (ex: /t 12 ou /t 22:30)");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /v [modelo] - Criar veículo (ex: /v 411)");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /anim - Ressincronizar animações dos actors");
        SendClientMessage(playerid, SAMSP_COR_OK, "  /jetpack, /spawn, /pos - Utilidades gerais");
        return 1;
    }
    return 0;
}
