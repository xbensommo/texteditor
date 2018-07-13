export function getRange(){
	const selection =  window.getSelection()

	if(selection && selection.rangeCount > 0)
		return selection.getRangeAt(0) //return range of selected html element
}

export function applyRange(range){
	const selection = window.getSelection()

	if(selection){
		selection.removeAllRanges()
		selection.addRange(range)
	}
	//the range , helps select the users input or set a visible selection to it..
}

export function getPrecedingRange(){
	const r = getRange()

	if(r){
		const range =  r.cloneRange()
		range.collapse(true)
		range.setStart(range.endContainer,0)
		//precedingChar = range.toString().slice(total);
		return range
		//based on caret position. 
		//convert it to string and slices it to get the last charcter but it must have the (containerEl, total) as a parameter..

	}
}

export function insertText (text, ta) {
      const start = ta.selectionStart, end = ta.selectionEnd;

      ta.value = ta.value.slice(0, start) +text + ta.value.slice(end);

      const newEnd = start + text.length;
      ta.selectionStart = newEnd; ta.selectionEnd = newEnd;

      //inserts text input or textarea fields...
}

export function getCharPrecedingCaret(containerEl, total) {
    //var precedingChar = null;
    const range = getRange()

    range.collapse(true)
    range.setStart(containerEl, 0)
    return range.toString().slice(total) //preceding Char..
    //activate this when user types the sign and count 3 charcters back...
    //it return the preceding charcters of the caret...
}

export function selectionCharcterOffset(element){
	const range  = getRange();
	var end = null, start = null;
	if(range){
		const caretRange =  range.cloneRange()
		caretRange.selectNodeContents(element)

		caretRange.setEnd(range.startContainer, range.startOffset)
		start =  caretRange.toString().length;

		caretRange.setEnd(range.endContainer, range.endOffset);
		end = caretRange.toString().length;
	}
	return {end:end, start:start}

	//has replaced getSelectionCharacterOffsetWithin(element)
	//shows the position of caret and (start && end of selected range)
	//the difference between the end && start is the length of the selection...
}

export function setCursor(parentEl, thisEl){
	const selection = window.getSelection()
	
	if(selection){
		
		parentEl.appendChild(document.createTextNode(" "))
		var range  = document.createRange()
		range.setEndAfter(thisEl)
		range.setStartAfter(thisEl)

		selection.removeAllRanges()
		parentEl.focus()
		selection.addRange(range)
	}

	//set the cursor after this element (thisEl)
}

export function selectUserInput(txtNode, obj)
	{
		const range = getRange(), 
			{ at, index } = getAtAndIndex( getPrecedingRange().toString(), ['@', '#'] );

		if(obj.ind+1 > txtNode.length){
			if(typeof txtNode.wholeText[index - 3] == "undefined"){
			 const common = range.commonAncestorContainer;

			 if(common.toString().indexOf("&nbsp;") == -1)
			 	range.setStart(txtNode, 0);
			 else
			 	range.setStart(txtNode, 2);

			range.setEnd(txtNode, txtNode.length)

			}else if(typeof txtNode.wholeText[index - 3] != "undefined"){
				range.setStart(txtNode, index)
				range.setEnd(txtNode, (index +1+obj.theValue.length))
			}
		}
		else{
			range.setStart(txtNode, index)

				if(index == obj.ind -1)
					{range.setEnd(txtNode, obj.end); console.log("damn")}
				else
					range.setEnd(txtNode, (index +1+ obj.theValue.length))		
		}
		applyRange(range) //select users input (theValue)

		range.deleteContents() //deletes it
}

export function clickSelect(txtNode, obj)
		{
			const range =  obj.range, 
					{ at, index }  = getAtAndIndex( txtNode.wholeText, ['@', '#'] );

			if(obj.ind > txtNode.length){
				if(typeof txtNode.wholeText[index - 3] == "undefined"){
					range.setStart(txtNode, 2)
					range.setEnd(txtNode, txtNode.length)

				}else if(typeof txtNode.wholeText[index - 3] != "undefined"){
					range.setStart(txtNode, index)
					range.setEnd(txtNode, (index +1+obj.theValue.length))
				}

			}
			else{
				range.setStart(txtNode, index)

					if(index == (obj.ind -1)){
						range.setEnd(txtNode, obj.endCaret)
					}else{
						range.setEnd(txtNode, (index +1+ obj.theValue.length))
					}
			}

			applyRange( range )
			range.deleteContents(); //deletes thevalue in in the calling function ...

}

export function handleInsert(txtparent, obj)
	{
		const atag = document.createElement('a'), aspan = document.createElement('span');
		
		const {at, index} =  getAtAndIndex(getPrecedingRange().toString(), ['@', '#']);

		atag.innerText = at+obj.selValue; atag.id = obj.selValue; 
		atag.className ='userMention user_mentions';

		if(at == '@')
			atag.href ='/xs/'+obj.selValue;
		if(at == '#')
			atag.href ='/hashtags/'+ at+obj.selValue;
		
		aspan.appendChild(atag)

		const range = getRange()

		if(txtparent.hasChildNodes() && txtparent.childNodes.length > 1){
			selectUserInput(range.commonAncestorContainer, obj)
			//why?? due to the mono signs,
		}
		if(txtparent.childNodes.length == 1){
			selectUserInput(txtparent.childNodes[0], obj)
			//why?? the there is only one child html node in the parent container
		}

		document.execCommand('insertHTML', false, '&nbsp;');
		range.insertNode(aspan); //insert at position....
		setCursor( txtparent, aspan );
		document.execCommand('insertHTML', false, '&nbsp;');
		document.execCommand('insertText', false, ' ');
}

export function shouldActivate(el)
	{	
		var sel =  selectionCharcterOffset(el).end;
		if(el.innerText[sel-2] == undefined){
			return true;
		}
		if(el.innerText[sel-2] != undefined && (el.innerText[sel-2] == ' ' || el.innerText[sel-2] == ',') && (el.innerText[sel-2] != '#'|| el.innerText[sel-2] != '@')){
			return true;
		}
		else{
			return false;
		}
		//checks what is following the sign and then activate if nothing or ,
}

export function getChildValue(el, counter){
		let inner = el.children[counter];

		if(typeof inner.children[1] == "undefined")
			return inner.innerText; //hashtags
		else
			return inner.children[1].innerHTML; //user mentions...
}

export function moveCursor( pos, el)
	{
		if(el.children[pos] != null){
			for (var i = 0; i < el.children.length; i++) {
				el.children[i].classList.remove( "highlighted" )
			}
			el.children[pos].classList.add( "highlighted" )
		}
}

export function getAtAndIndex(text, ats) {
  return ats.map((at) => {
    return { at, index: text.lastIndexOf(at) }
  }).reduce((a, b) => {
    return a.index > b.index ? a : b
  })
  //gets the sign and its index.. but it returns the last one... with that said, 
}

export function displayMatches( matchedList, wrapper, cursorPosition){	
	var counter = 0

	while( counter < Object.keys(matchedList).length ){
		let tmp =  matchedList[counter];
		if(tmp.img != null){
			wrapper.innerHTML += ( counter == 0) ? "<li class='listed-results highlighted' tabindex='" +counter 
												  +"'><img class='circle autocompletion-25-avatar' width='25px' height='25px' src="+ tmp.img 
												  +"><span>"+ tmp.text +"</span> </li>" 
												: "<li class='listed-results' tabindex='" +counter 
												+"'><img class='circle autocompletion-25-avatar' width='25px' height='25px' src="+tmp.img +"><span>"+ tmp.text 
												+"</span> </li>";
			
		}
		if(tmp.img == null){
			wrapper.innerHTML += "<li class='listed-results' tabindex='" +counter +"'><span>"+ tmp.text +"</span> </li>";
		}
		counter++;
	}
	moveCursor( cursorPosition, wrapper )

	toggleResults( "show", wrapper)
	//this txteditor is responsible for displaying not querying the database for matches
}

export function toggleResults( action, el)
	{
		if( action == "show" ){
			return el.classList.add( "visible" )
		}else if( action == "hide" ){
			el.innerHTML = null; return el.classList.remove( "visible" )
		}
}

export function closeModal(){
      var overlay = document.getElementById('editOverlay');
      overlay.classList.add("is-hidden"); 
}

export function typeImg(imgs, _type){
	const images  =  JSON.parse(imgs);
	return images[_type]
}