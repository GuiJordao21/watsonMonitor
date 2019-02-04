const watson = require("watson-developer-cloud"),
    sgMail = require("@sendgrid/mail");

/**
 * Created by: Guilherme Jordão
 * 
 * @param {Object} parameters - all details this module needs to run smoothilly.
 * @param {string} parameters.sendgridKey - key to use sendgrid API.
 * @param {string} parameters.watsonAssistantKey - WatsonAssistant API key
 * @param {string} parameters.watsosWorkspaceId - WatsonAssistant workspaceId
 * @param {number} [parameters.watsonCheck = 1] - seconds to wait before check watson API again.
 * @param {number} [parameters.errsClear = 60] - seconds to wait before clear error cache.
 * @param {number} [parameters.emailTime = 30] - minutes to wait before send another email.
 * @param {string} [parameters.intent = "email"] - Intent to check on watson assistant.
 * @param {string[]} [parameters.listEmails = []] - List of email addresses that will recieve emails in case watson does not provide one.
 */

function assistant(parameters) {

    sgMail.setApiKey(parameters.sendgridKey);

    var totalErr = 0,
        emailsList = parameters.listEmails,
        timeControl = [0, 0],
        timeElapsed = [0, 0],
        lastError;

    setInterval(() => { clearErrs() }, parameters.errsClear*1000);
    setInterval(() => { checkWatson() }, parameters.watsonCheck*1000);

    function checkWatson() {
        if (totalErr >= 10) {
            if ((timeElapsed[0] - timeControl[0]) >= (parameters.emailTime*60)) {
                errEmail();
            } else {

                console.error(`the error happened, but we need to wait 30 minutes before sending another email.`);
                console.error(`Last known errro ---> ${lastError}`);

            }
        } else {
            timeElapsed = process.hrtime();
            assistantCall();
        }
    }

    function errEmail() {

        console.log("sending emails now...");

        emailsList.forEach(email => {
            const msg = {
                to: email,
                from: "watson_monitor@noreply.com",
                subject: "Assistant Failed",
                text: "Service verification",
                html: `<strong>Watson assistant not responding. Last known error ---> ${lastError}</strong>`,
            };
            sgMail.send(msg);
        });

        timeControl = process.hrtime();

    }

    function assistantCall() {

        var assistant = new watson.AssistantV1({
            iam_apikey: parameters.watsonAssistantKey,
            version: "2018-09-20",
            url: "https://gateway.watsonplatform.net/assistant/api"
        });

        var params = {
            workspace_id: parameters.watsosWorkspaceId,
            intent: parameters.intent,
        };

        assistant.listExamples(params, function (err, response) {
            if (err) {

                totalErr++;
                lastError = err;

                console.error(`ERROR CALLING ASSISTANT ---> ${err}`);
                console.log(totalErr);

            } else {

                if(parameters.intent == "email"){
                    emailsList = response.examples.map(x => {
                        return x.text;
                    });
                }

                console.log("emails will be send to:")
                console.log(emailsList);

            }
        });
    }

    function clearErrs() {

        console.log("Cleaning error cache...")
        totalErr = 0;

    }

}

module.exports = {
    assistant:assistant,
}