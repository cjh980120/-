// File: teamsBot.ts

import { TeamsActivityHandler, TurnContext } from "botbuilder";

export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
      // Handle incoming messages here
      const text = context.activity.text;

      
      await next();
    });
  }

 
}
