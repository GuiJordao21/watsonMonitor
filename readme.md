To use this module, first you need to have a sendgrid account. We only support this mailer for now.

We only monitor watson assistant now.

We check your assistant by calling the listExamples() function and checking the output. The standard way is to create an intent, called "email", and add all the email addresses you want to be warned as examples of that intent. When the method is called, we use this list to send the emails. If you don't want to do things this way, you can pass your on array of emails, just check the example.

you need a Object with this fields

```

const monitor = require("watson-monitor");

let params = {
    sendgridKey: "string", //key to use sendgrid API [mandatory].
    watsonAssistantKey: "string", //WatsonAssistant API key [mandatory].
    watsosWorkspaceId: "string", //WatsonAssistant workspaceId [mandatory].
    verbose: true, //routine's to show text output [optional][standard == true].
    watsonCheck: Number, //seconds to wait before check watson API again [optional][standard == 1].
    errsClear: Number, //seconds to wait before clear error cache [optional][standard == 60].
    emailTime: Number, //minutes to wait before send another email [optional][standard == 30].
    intent: "string", //Intent to check on watson assistant [optional][standard == "email"].
    listEmails: string[], //List of email addresses that will recieve emails in case watson does not provide one [optional][standard == []].
}

monitor.assistant(params);

```