var xml2js = require('xml2js');
var util = require('util');
var xml = "<root>Hello Chengzi!!!</root>";

/**
 * xml -> json
 */

xml = '<Notify Type="DetectBoxes">\n' +
    '\t<DetectBoxes>\n' +
    '\t\t<Box bottom="944" category="0" left="255" right="382" top="399"/>\n' +
    '\t\t<Box bottom="1079" category="0" left="1756" right="1919" top="241"/>\n' +
    '\t</DetectBoxes>\n' +
    '</Notify>';

var xmlParser = new xml2js.Parser();
xmlParser.parseString(xml, function (err, result) {
    console.log(typeof util.inspect(result, false, null));
})


/**
 * json -> xml
 */

obj = {
    Notify:
        {
            '$': {Type: 'DetectBoxes'},
            DetectBoxes:
                [{
                    Box:
                        [{
                            '$':
                                {
                                    bottom: '944',
                                    category: '0',
                                    left: '255',
                                    right: '382',
                                    top: '399'
                                }
                        },
                            {
                                '$':
                                    {
                                        bottom: '1079',
                                        category: '0',
                                        left: '1756',
                                        right: '1919',
                                        top: '241'
                                    }
                            }]
                }]
        }
}




var builder = new xml2js.Builder();
var jsonxml = builder.buildObject(obj);
console.log(jsonxml);




