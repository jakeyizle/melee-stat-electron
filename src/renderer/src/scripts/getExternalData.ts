export async function getrankedSeasons(connectCode: string) {
  const url = 'https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql'
  const data = JSON.stringify({
    "operationName": "AccountManagementPageQuery",
    "variables": {
      "cc": connectCode
    },
    "query": "fragment profileFields on NetplayProfile {\n ratingOrdinal\n wins\n losses\n characters {\n character\n gameCount\n }\n }\n\nfragment userProfilePage on User {\n netplayProfiles {\n ...profileFields\n season {\n name\n status\n }\n }\n }\n\nquery AccountManagementPageQuery($cc: String!) {\n getConnectCode(code: $cc) {\n user {\n ...userProfilePage\n }\n }\n}\n"
  });
  let headers = new Headers();
  headers.append("content-type", "application/json");
  const requestOptions: RequestInit = {
    method: 'POST',
    body: data,
    redirect: 'follow',
    headers: headers
  };

  const result = await fetch(url, requestOptions)
  const text = await result.text();
  const json = JSON.parse(text);
  return json.data.getConnectCode.user.netplayProfiles as RankedSeason[]
}



