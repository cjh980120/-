import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import notificationTemplate from "../adaptiveCards/notification-default.json";
import { CardData } from "../cardModels";
import { notificationApp } from "../internal/initialize";





interface ItemData {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}



interface ApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
    dataType: string;
    items: {
      item: ItemData[]; 
    };
    pageNo: number;
    numOfRows: number;
    totalCount: number;
  };
  };
}
interface ResultData{
 
  other:{SNO:boolean,PCP:boolean,TMP:string,standTime:string}[]
}
const getData = async (date: string, time?: number): Promise<ResultData | void> => {
  let resData:ResultData
  const defaultTime = time ?? 1700;
  const key =
    '%2FP%2F2Sf%2F24K8WpOxNpkbqdpDm9Fs5qbnCum2Og5e3lX1JkNNXtS0lLMrRLuff3IQoaAFecCKx6yFTBeLe1JRv2w%3D%3D';

  const apiUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${key}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${date}&base_time=${defaultTime}&nx=62&ny=125`;
  console.log(apiUrl)
  try {
    const res: ApiResponse = await fetch(apiUrl).then((v) => v.json());
    const code = res.response.header.resultCode;

    if (code === '00') {
      const today = new Date('2024-01-08');
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      const nextDayFormatted = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;

     const data =res.response.body.items.item.filter(v=>v.fcstDate ===nextDayFormatted &&(v.fcstTime==="0700"||v.fcstTime==="0800") )
    
      const seven  = data.filter(v=>v.fcstTime==="0700")
      const eight  = data.filter(v=>v.fcstTime==="0800")
      const sevenTMP= seven.find(v=>v.category ==="TMP").fcstValue
      const sevenPCP= seven.find(v=>v.category ==="PCP").fcstValue ==="강수없음"?false:true
      const sevenSNO= seven.find(v=>v.category ==="SNO").fcstValue ==="적설없음"?false:true
      const eightTMP= eight.find(v=>v.category ==="TMP").fcstValue
      const eightPCP= eight.find(v=>v.category ==="PCP").fcstValue ==="강수없음"?false:true
      const eightSNO= eight.find(v=>v.category ==="SNO").fcstValue ==="적설없음"?false:true
        
      const dummy: ResultData = {
        other: [
          { SNO: sevenSNO, PCP: sevenPCP, TMP: sevenTMP, standTime: "0700" },
          { SNO: eightSNO, PCP: eightPCP, TMP: eightTMP, standTime: "0800" },
    ],
} ;
      return dummy;
    } else if (['20', '21', '22', '30', '31', '33', '99'].includes(code)) {
      throw new Error('Error occurred: ' + code);
    } else {
      return getData(date, defaultTime - 30);
    }
  } catch (error) {
    console.error('Error during API call:', error);
    throw error;
  }
};
const weatherTrigger: AzureFunction = async function (context: Context, weatherTrigger: any): Promise<void> {
 const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  const timeStamp = `${year}${month}${day}`;
  const current =`${year}.${month}.${day}`;
  const pageSize = 100;
  let continuationTokens: string | undefined = undefined;
  
// getData 함수 호출
getData(timeStamp)
  .then(async (data:ResultData) => {
        const sevenData= data.other.find(v=>v.standTime==="0700")
        const eightData= data.other.find(v=>v.standTime==="0800")

    do {
      const pagedData = await notificationApp.notification.getPagedInstallations(
        pageSize,
        continuationTokens
      );
      const installations = pagedData.data;
      continuationTokens = pagedData.continuationToken;
      
      for (const target of installations) {
        // 여기에서 데이터를 사용하여 로직을 수행
await target.sendAdaptiveCard(
  AdaptiveCards.declare<CardData>(notificationTemplate).render({
    title: "내일 날씨",
    appName: "",
    description: `${current}(18:00) 기준 내일 날씨입니다.



${sevenData.standTime}

기온: ${sevenData.TMP}℃
비: ${sevenData.PCP ? "예정" : "예정없음"}
눈: ${sevenData.SNO ? "예정" : "예정없음"}


${eightData.standTime}

기온: ${eightData.TMP}℃
비: ${eightData.PCP ? "예정" : "예정없음"}
눈: ${eightData.SNO ? "예정" : "예정없음"}

`, 
  })
);

      }
    } while (continuationTokens);
  })
  .catch((error) => {
    // getData 호출 중에 오류가 발생한 경우 처리
    console.error('Error:', error);
  });
};

export default weatherTrigger;
