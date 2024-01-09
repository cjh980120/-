import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import config from "./config";
import { DoStuffActionHandler } from "../cardActions/doStuffActionHandler";
import { snackCommandHandler } from "../commands/snackCommandHandler";

export const notificationApp = new ConversationBot({
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
  // Enable notification
  notification: {
    enabled: true,
  },
   command: {
    enabled: true,
    commands: [new snackCommandHandler()],
  },
  cardAction: {
    enabled: true,
    actions: [new DoStuffActionHandler()],
  },
});
