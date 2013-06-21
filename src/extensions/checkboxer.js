// - 
//

(function() {
  var checkboxer = function(converter) {
    var generate_uuid = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        r = Math.random()*16|0;
        v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    };

    return [
      {
        name: 'preparser',
        type: 'lang', 
        filter: function(text) {
          var whole_list = /(\s|\n)?(\s{0,3})(\\)?([*+\-]|\d+[.])[ \t]+\[(\s|\*)\](\[([\w\-]+)\]+)?/gi;

          return text.replace(whole_list, 
            function(match, m1, m2, m3, marker, checked, m4, uuid, m5) {
            if (uuid === '' || (typeof uuid === 'undefined')) {
              match = match+'['+generate_uuid()+']';
            }

            return match;
          });
        }
      },
      {
        type: 'output',
        filter: function(source) {
          // return source.replace(/(<li><p>|\s?\-\s)(\[\s\]|\[\*\]|<em>)\[([\w\-]+)\](\s?[\w\s]+)/gi, 
          return source.replace(/((<li>)(<p>)?)(\[\s\]|\[\*\]|\[<\/?em>\])(\[([\w\-]+)\])(\s?[\w\s]+)/gi, 
            function(match, lip, li, p, checkmark, uuid_attr, uuid, content) {
              // console.log(lip, li, p, checkmark, uuid_attr, uuid, content);

              if (
                (li == '<li>') &&
                (checkmark == '[ ]' || checkmark == '[*]' || checkmark == '[<em>]' || checkmark == '[</em>]')
               ) {
                lip = '<li class="li-checkbox">'+(p||"");
                checked = checkmark == '[*]' || checkmark == '[<em>]' || checkmark == '[</em>]' ? 
                  'checked="checked"' : "";
                return lip+'<input type="checkbox" '+checked+
                  ' class="checkboxer-checkbox" data-checkboxer-uuid="'+uuid+'" /> '+content;
              }

              return match;
            }
          );
        }
      }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.checkboxer = checkboxer; }
  // Server-side export
  if (typeof module !== 'undefined') module.exports = checkboxer;
}());
