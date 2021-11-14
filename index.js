const AWS = require('aws-sdk')

exports.handler = (event) => {

  const request = JSON.parse(event.body);

  const DISALLOWED_LABELS = [`Explicit Nudity`,
    `Suggestive`,
    `Violence`,
    `Visually Disturbing`,
    `Rude Gestures`,
    `Drugs`,
    `Tobacco`,
    `Alcohol`,
    `Gambling`,
    `Hate Symbols`]

  //Call Rekognition  
  var rekognition = new AWS.Rekognition({region: `us-east-1`});
  var params = {
    Image: {
      Bytes: request.image
    }, MinConfidence: 95
  }
  rekognition.detectModerationLabels(params, function (error, data) {
    if (error) {
      console.error(error)
      return { statusCode: 400, body: JSON.stringify(error) }
    }
    data.ModerationLabels.forEach(label => {
      if (DISALLOWED_LABELS.contains(label.Name)) {
        return {
          statusCode: 400, body: JSON.stringify({
            ImageModeration: `fail`,
            Description: `Image contains depiction of ${label.Name}`
          })
        }
      }
    })
    return {
      statusCode: 200, body: JSON.stringify({
        ImageModeration: `pass`,
        Description: `Image can be posted`
      })
    }
  })
}