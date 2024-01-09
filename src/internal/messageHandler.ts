import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { TeamsBot } from "../teamsBot";
import { notificationApp } from "./initialize";
import { ResponseWrapper } from "./responseWrapper";
import { TurnContext } from "botbuilder";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  const res = new ResponseWrapper(context.res);
  const teamsBot = new TeamsBot();
  await notificationApp.requestHandler(req, res, async (context:TurnContext) => {
    
    await teamsBot.run(context);
  });
  return res.body;
};

export default httpTrigger;
