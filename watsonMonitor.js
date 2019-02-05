const watson = require("watson-developer-cloud"),
    sgMail = require("@sendgrid/mail");

/**
 * Created by: Guilherme Jordão
 * https://github.com/GuiJordao21
 * 
 * @param {Object} parameters - all details this module needs to run smoothilly.
 * @param {string} parameters.sendgridKey - key to use sendgrid API.
 * @param {string} parameters.watsonAssistantKey - WatsonAssistant API key
 * @param {string} parameters.watsosWorkspaceId - WatsonAssistant workspaceId
 * @param {boolean} [parameters.verbose = true] - routine's text output.
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

    setInterval(() => {

        let resp = clearErrs();

        if (parameters.verbose == true) {
            console.log(resp);
        }

    }, parameters.errsClear * 1000);
    
    setInterval(() => {

        let resp = checkWatson();

        if (parameters.verbose == true) {
            console.log(resp);
        }

    }, parameters.watsonCheck * 1000);

    function checkWatson() {
        if (totalErr >= 10) {
            if ((timeElapsed[0] - timeControl[0]) >= (parameters.emailTime * 60)) {
                return errEmail();
            } else {

                return `the error happened, but we need to wait 30 minutes before sending another email.\nLast known errro ---> ${lastError}`;

            }
        } else {
            timeElapsed = process.hrtime();
            return assistantCall();
        }
    }

    function errEmail() {

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

        return `sending emails now...`

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

                return `ERROR CALLING ASSISTANT ---> ${err}\n${totalErr}`;

            } else {

                if (parameters.intent == "email") {
                    emailsList = response.examples.map(x => {
                        return x.text;
                    });
                }

                return `emails will be send to:\n${emailsList}`;

            }
        });
    }

    function clearErrs() {

        totalErr = 0;
        return `Cleaning error cache...`

    }

}

module.exports = {
    assistant: assistant,
}