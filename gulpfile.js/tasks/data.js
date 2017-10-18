var fs           = require("fs");
var join         = require('path').join;
var config       = require('../config');
var parse        = require('csv-parse');

module.exports = {
    sort: function() {
        var betterData = new Array();
        var columns = ['region','region_id','region_to','region_to_id','sending_name','sending_code','receiving_name','receiving_code','value','value2','value3','value4','amount_1990','amount_1995','amount_2000','amount_2005','notes']
        fs.readFile('data/immigration.csv', 'utf8', function(err, data) {
            parse(data, {columns: columns, trim: true}, (err, output) => {
                console.log(output)
                for(var i = 0; i < output.length; i++) {
                    betterData.push([1990, output[i].sending_name, output[i].receiving_name, output[i].amount_1990]);
                    betterData.push([1995, output[i].sending_name, output[i].receiving_name, output[i].amount_1995]);
                    betterData.push([2000, output[i].sending_name, output[i].receiving_name, output[i].amount_2000]);
                    betterData.push([2005, output[i].sending_name, output[i].receiving_name, output[i].amount_2005]);
                }
                console.log(betterData)
                var csvContent = "data:text/csv;charset=utf-8,";
                var dataString = '';
                betterData.forEach(function(infoArray, index){
                   dataString = infoArray.join(",");
                   csvContent += index < betterData.length ? dataString+ "\n" : dataString;

                }); 

                fs.writeFile('data/immigration-fixed.csv', csvContent, function(err) {
                    console.log(err);
                }); 
            });
            
            
        });
    }
};
