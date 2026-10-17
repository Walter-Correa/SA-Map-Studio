#if !defined _samp_included
    #error "N-Mail: Defina A_SAMP!"
#endif

#include a_http

#if !defined a_Email_include
    #define a_Email_include
#endif

#define URL_SEND_EMAIL "darkstreetrp.com.br/samp/servermail/index.php"
#define SMTP_HOST "darkstreetrp.com.br"//smtp.gmail.com
#define SMTP_PORT 465
#define SMTP_USER "server@darkstreetrp.com.br"//darkstreetrpg@gmail.com
#define SMTP_PASS "eT69y2b3"//rdqdkkvtcywdemqk
#define SMTP_FROM "server@darkstreetrp.com.br"
#define SMTP_NAME "Dark Street Roleplay"
#define SMTP_AUTH "dKs_SmTp_SeNd_EmAiL"

new email_requests,email_url[256],EmailStr[4096];

stock SendEmailSMTP(to[],toname[],title[],msg[])
{
	format(email_url,sizeof(email_url),"%s?auth=%s",URL_SEND_EMAIL,SMTP_AUTH);
    format(EmailStr,sizeof(EmailStr),"to=%s&toname=%s&title=%s&msg=%s&name=%s&user=%s&pass=%s&from=%s&host=%s&port=%i",
	to,toname,title,msg,SMTP_NAME,SMTP_USER,SMTP_PASS,SMTP_FROM,SMTP_HOST,SMTP_PORT);
    return HTTP(email_requests,HTTP_POST,email_url,EmailStr,"OnEmailResponse");
}

forward OnEmailResponse(index, response_code, data[]);
public OnEmailResponse(index, response_code, data[])
{
    email_requests++;
	if(data[0])
	{
		EmailStr[0] = EOS;
		format(EmailStr,1024,"%s",data);
		printf("[Email] %s",EmailStr);
	}
    return 1;
}
