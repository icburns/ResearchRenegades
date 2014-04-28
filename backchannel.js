"use strict";
(function()
{
    $(document).ready(function() {
        $('form[name=makeNewPost]').submit(function(e){
            e.preventDefault();
            console.log("post="+$('input[name=newPost]')[0].value);
            $.ajax({
                type: 'POST',
                url: '',
                data: 'post='+$('input[name=newPost]')[0].value, 
                success: function(msg) {
                }
            });
        });     
    });      
})();