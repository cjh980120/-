import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import helloWorldCard from "../adaptiveCards/helloworldCommandResponse.json";
import { CardData, stuffCardData } from "../cardModels";

export class snackCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = "!간식내기";

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {
    console.log(`Bot received message: ${message.text}`);

    const mentionedUsersRegex = /@\w+/g;
    const mentionedUsers = message.text.match(mentionedUsersRegex) || [];

    if (mentionedUsers.length === 0) {
     const cardData: stuffCardData = {
      title: "간식 내기 사용법",
      body :"!간식내기 @ex1 @ex2 @ex3"
    };
        const cardJson = AdaptiveCards.declare(helloWorldCard).render(cardData);

     await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(cardJson)],
    });
    return
    }


    const selectedUser = this.getRandomUser(mentionedUsers);

    const cardData: stuffCardData = {
      title: "🎈오늘 행운의 주인공🎈",
      body: `${selectedUser.replace("@","")}`,
    };

    const cardJson = AdaptiveCards.declare(helloWorldCard).render(cardData);

    // Send the adaptive card as a reply
    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(cardJson)],
    });
  }

  private getRandomUser(users: string[]): string {
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
  }
}
