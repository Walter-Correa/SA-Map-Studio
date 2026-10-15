//Gangzones com bordas

enum GangZonesInfo
{
	Float:GZ_MinX,
	Float:GZ_MinY,
	Float:GZ_MaxX,
	Float:GZ_MaxY,
	GZ_Border[4],
 	GZ_Bordercolor
}
static GangZones[MAX_GANG_ZONES][GangZonesInfo];

stock new_GangZoneCreate(Float:minx, Float:miny, Float:maxx, Float:maxy, border = 1, Float:bordersize = 1.0, bordercolor = 0x00000060)
{
	new zone = GangZoneCreate(minx, miny, maxx, maxy);
	if(IsValidGangZone(zone))
	{
		GangZones[zone][GZ_MinX] = minx;
		GangZones[zone][GZ_MinY] = miny;
		GangZones[zone][GZ_MaxX] = maxx;
		GangZones[zone][GZ_MaxY] = maxy;
		if(border)
		{
			#define SEPERATION  (2.0 * bordersize)//the seperation value to differenciate borders from gangzone, set accordingly! (Default: 2.0)
			GangZones[zone][GZ_Border][0] = GangZoneCreate(minx - SEPERATION, miny, minx + SEPERATION, maxy);//border 1
			GangZones[zone][GZ_Border][1] = GangZoneCreate(minx - SEPERATION, maxy - SEPERATION, maxx, maxy + SEPERATION);//border 2
			GangZones[zone][GZ_Border][2] = GangZoneCreate(maxx - SEPERATION, miny, maxx + SEPERATION, maxy);//border 3
			GangZones[zone][GZ_Border][3] = GangZoneCreate(minx - SEPERATION, miny - SEPERATION, maxx, miny + SEPERATION);//border 4
			GangZones[zone][GZ_Bordercolor] = bordercolor;
		}
		else
		{
			GangZones[zone][GZ_Border][0] = -1;
			GangZones[zone][GZ_Border][1] = -1;
			GangZones[zone][GZ_Border][2] = -1;
			GangZones[zone][GZ_Border][3] = -1;
		}
	}
	return zone;
}
#if defined _ALS_GangZoneCreate
    #undef GangZoneCreate
#else
    #define _ALS_GangZoneCreate
#endif
#define GangZoneCreate new_GangZoneCreate

stock new_GangZoneDestroy(zone)
{
  	if(!IsValidGangZone(zone)) return false;
	
  	GangZones[zone][GZ_MinX] = 0.0;
	GangZones[zone][GZ_MinY] = 0.0;
	GangZones[zone][GZ_MaxX] = 0.0;
	GangZones[zone][GZ_MaxY] = 0.0;
 	for(new i = 0; i < 4; i++)
 	{
    	if(IsValidGangZone(GangZones[zone][GZ_Border][i])) GangZoneDestroy(GangZones[zone][GZ_Border][i]);
 	}
	GangZoneDestroy(zone);
  	return true;
}
#if defined _ALS_GangZoneDestroy
    #undef GangZoneDestroy
#else
    #define _ALS_GangZoneDestroy
#endif
#define GangZoneDestroy new_GangZoneDestroy

stock new_GangZoneShowForPlayer(playerid, zone, color)
{
  	if(!IsValidGangZone(zone)) return false;

	GangZoneShowForPlayer(playerid, zone, color);
 	for(new i = 0; i < 4; i++)
	{
		if(IsValidGangZone(GangZones[zone][GZ_Border][i])) GangZoneShowForPlayer(playerid, GangZones[zone][GZ_Border][i], GangZones[zone][GZ_Bordercolor]);
	}
	return true;
}
#if defined _ALS_GangZoneShowForPlayer
    #undef GangZoneShowForPlayer
#else
    #define _ALS_GangZoneShowForPlayer
#endif
#define GangZoneShowForPlayer new_GangZoneShowForPlayer

stock new_GangZoneShowForAll(zone, color)
{
  	if(!IsValidGangZone(zone)) return false;

 	GangZoneShowForAll(zone, color);
	for(new i = 0; i < 4; i++)
	{
		if(IsValidGangZone(GangZones[zone][GZ_Border][i])) GangZoneShowForAll(GangZones[zone][GZ_Border][i], GangZones[zone][GZ_Bordercolor]);
	}
	return true;
}
#if defined _ALS_GangZoneShowForAll
    #undef GangZoneShowForAll
#else
    #define _ALS_GangZoneShowForAll
#endif
#define GangZoneShowForAll new_GangZoneShowForAll

stock new_GangZoneHideForPlayer(playerid, zone)
{
  	if(!IsValidGangZone(zone)) return false;

	GangZoneHideForPlayer(playerid, zone);
	for(new i = 0; i < 4; i++) if(IsValidGangZone(GangZones[zone][GZ_Border][i])) GangZoneHideForPlayer(playerid, GangZones[zone][GZ_Border][i]);
	return true;
}
#if defined _ALS_GangZoneHideForPlayer
    #undef GangZoneHideForPlayer
#else
    #define _ALS_GangZoneHideForPlayer
#endif
#define GangZoneHideForPlayer new_GangZoneHideForPlayer

stock new_GangZoneHideForAll(zone)
{
  	if(!IsValidGangZone(zone)) return false;

	GangZoneHideForAll(zone);
	for(new i = 0; i < 4; i++) if(IsValidGangZone(GangZones[zone][GZ_Border][i])) GangZoneHideForAll(GangZones[zone][GZ_Border][i]);
	return true;
}
#if defined _ALS_GangZoneHideForAll
    #undef GangZoneHideForAll
#else
    #define _ALS_GangZoneHideForAll
#endif
#define GangZoneHideForAll new_GangZoneHideForAll