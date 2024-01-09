import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import notificationTemplate from "../adaptiveCards/notification-default.json";
import { CardData } from "../cardModels";
import { notificationApp } from "../internal/initialize";


const timerTrigger: AzureFunction = async function (context: Context, reportTrigger: any): Promise<void> {
  const timeStamp = new Date().toISOString();
  const pageSize = 100;
  let continuationToken: string | undefined = undefined;
   do {
    const pagedData = await notificationApp.notification.getPagedInstallations(
      pageSize,
      continuationToken
    );
    const installations = pagedData.data;
    continuationToken = pagedData.continuationToken;
    for (const target of installations) {
      await target.sendAdaptiveCard(
        AdaptiveCards.declare<CardData>(notificationTemplate).render({
          title: "금일은 수요일 주간보고 업무보고하는 날입니다!",
          appName: "EXPORUM DX",
          description: ``,
          notificationUrl: "https://exporuminc.sharepoint.com/:x:/s/team-dx/EYjLBb4dftJFhKJSr2F_h9gBzkWebeJZJ-0UGh2ov_HaYA?e=ylv8IU&nav=MTVfe0I0RUJBNkIwLUM1Q0EtNDIzOC1BNkMxLTk1MTAxMjFCRTk1OH0",
        })
      );
    }
  } while (continuationToken);
};
export default timerTrigger;
