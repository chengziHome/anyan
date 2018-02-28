var xml2js = require('xml2js');
var util = require('util');
var xml = "<root>Hello Chengzi!!!</root>";

/**
 * xml -> json
 */

xml = '<Notify Type="Alarming">\n' +
    '\t<Alarming channelID="4" opt="subscribe" stamp="2018-02-09 12:12:13" type="0">\n' +
    '\t\t<Picture length="35780"/>\n' +
    '\t\t<Picture length="35230"/>\n' +
    '\t\t<Picture length="1220"/>\n' +
    '\t\t<Picture length="3380"/>\n' +
    '\t</Alarming>\n' +
    '</Notify>';

var xmlParser = new xml2js.Parser();
xmlParser.parseString(xml, function (err, result) {
    console.log(Object.prototype.toString.call(result));
    console.log(util.inspect(result, false, null));
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




