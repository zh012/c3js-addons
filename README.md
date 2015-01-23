# c3js-addons
===

### c3-legend-actions.js

* popup action menu on hover the legend.

###### Configuration


    legend: {
        position: 'right',
        actions: [
            {
            bsicon: 'edit',
            name: 'edit',
            text: 'Edit',
            callback: function(id){alert('Edit ' + id);}
            },
            {
            bsicon: 'trash',
            name: 'delete',
            text: 'Delete',
            callback: function(id){alert('Delete ' + id);}
            }
        ]
    }
    

###### Example

  http://jsfiddle.net/zh012/jtum168r/2/
  
###### Screenshot

  ![alt tag](https://raw.githubusercontent.com/zh012/c3js-addons/master/screenshot/legend-actions.png)
  
