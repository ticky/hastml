export default (html, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('A callback is required!');
  }

  // Stack for keeping track of SGML fragments encountered
  const stack = [];

  // We piggyback on `replace`, which means you can walk the tree and replace
  // stuff within it, but you don't have to!
  return html.replace(
    /(<(?:!--|\/?([^\s/>]*))|\/>|(?:--)?>)/gi,
    (match, tagFragment, tagName, offset, string) => {
      // This callback is called for every "tag fragment" encountered.
      // This doesn't guarantee the SGML is valid, compliant, or even useful,
      // but it's simple and permissive enough to let you build smarter things
      // atop it.

      // If we have a tag name, this is an opening tag and we want to strip the
      // name from the fragment
      if (tagName) {
        tagFragment = tagFragment.replace(tagName, '');
      }

      let thisTag;
      const lastTag = stack[stack.length - 1] || {};
      let shouldPopStack = false;

      // Based upon the first one to four characters of the match, we know
      // certain different things are happening
      switch (tagFragment) {
        case '<':
        case '<!--':
          // A tag or comment is opening, push an object onto the tagstack
          thisTag = {
            tagName,
            state: 'open',
            openIndex: offset
          };

          stack.push(thisTag);
          break;

        case '>':
          // A non-void element tag is either beginning content, or closing
          switch (lastTag.state) {
            case 'open':
              lastTag.contentIndex = offset;
              lastTag.state = 'content';
              break;
            case 'closing':
              lastTag.closeIndex = offset;
              shouldPopStack = true;
              break;
          }

          break;

        case '/>':
        case '-->':
          // A void element or comment tag is closing
          lastTag.closeIndex = offset;
          shouldPopStack = true;
          break;

        case '</':
          // A non-void element tag's closing tag is beginning
          lastTag.closingIndex = offset;
          lastTag.state = 'closing';
          break;
      }

      // We call back, supplying the arguments suppled to String.replace's
      // callback, as well as some of our own stuff
      const returnValue = callback(
        match,
        tagFragment,
        offset,
        string,
        thisTag || lastTag,
        stack
      );

      if (shouldPopStack) {
        stack.pop();
      }

      // Don't replace values if the callback didn't explicitly return
      if (typeof returnValue !== 'string') {
        return match;
      }

      return returnValue;
    }
  );
};
