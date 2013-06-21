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
        // Parse and add a UUID to each checkbox syntax that does not have one already
        name: 'preparser',
        type: 'lang', 
        filter: function(text) {
          var whole_list = /(\s|\n)?(\s{0,3})(\\)?([*+\-]|\d+[.])[ \t]+\[(\s|\*)\](\[([\w\-]+)\]+)?/gi;

          return text.replace(whole_list, 
            function(match, m1, m2, m3, marker, checked, m4, uuid, m5) {
            // TODO better arguement names
            // console.log(match, marker, checked, uuid, m3);

            // ensure multiple inline checkboxes are separated by a space, 
            //   ex : inline - [ ] this checkbox renders- [ ] this will not
            // and are not rendered in code blocks, must escape to achieve this for now
            //  ex : 
            //     \\- [ ] does not render in a code block
            // FIXME code blocks are tricky since we are pre-parsing to set uuid back to the
            // original text, so this runs twice, the first time would strip the slashes
            // then the actual preview makeHtml() call would no loner see those backslashes
            // and renders the checkbox
            // FIXME this breaks this
            // :markdown
            //   - [ ] No uuid for checkbox on first line
            //
            // if (m1 === '')  return match; 
            // if (m3 === '\\') return match;

            // suffix a uuid, supplement to help locate the checkbox
            // ex: 
            //   - [ ] A checkbox
            //   becomes:
            //   - [ ][abcd-1234-efgh] A checkbox
            //
            // TODO these should be removed before saving the markdown, only need for location to mark/unmark
            if (uuid === '' || (typeof uuid === 'undefined')) {
              match = match+'['+generate_uuid()+']';
            }

            return match;
          });
        }
      },
      {
        // Render the checkboxes post list render
        type: 'output',
        filter: function(source) {
          // Uses the list style syntax
          //   ex:
          //   - [ ] An unchecked checkbox
          //   - [*] A checked checkbox
          //
          //     - [ ] This will work to (indented)
          //     - [*] This will work to (indented)
          //
          // TODO Also supports inline checkbox
          //   ex:
          //   inline - [ ] this checkbox renders- [ ] this will not

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
