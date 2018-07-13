<script>
	import { getRange,  applyRange, setCursor, selectionCharcterOffset, getPrecedingRange, selectUserInput, 
   	handleInsert,getCharPrecedingCaret, shouldActivate, getChildValue, clickSelect, moveCursor, getAtAndIndex, toggleResults, displayMatches } from './util.js'

   	import { randVal } from './otherUtil.js'
   	//ename is the event name, used to send the value to the main component,
   	//esetmatches is the event that this component is listening to get the matches from the main component...
   	//egetmatches is the event that this component is listening to get the matches (mentions or hashtags)
	export default {
		props: {
			eventname:{ type: String, required: true },
			members: { default: () => [], required: true },
		},
		
		data(){
			return {
				atresultWrapper: randVal(),
				isTyping: false, theValue: null, backspacing: false, endCaret: null, 
				startCaret:null,ind:null,
				cursorPosition: 0, matches: null,
			}
		},
		
		watch: {
			'members' (){
				if(this.members == null) return;
				this.matches =  null; this.matches =  this.members;
			}
		},
		
		methods: {
			handleInput(e)
				{
						const _vthis =  this.$refs.mainwrap, that = this,resultWrapper = document.getElementById( this.atresultWrapper ),
							text = getPrecedingRange().toString(), atItems = ['@', '#'], notAllowed = [',', '-', '@', '#', '%', '^', '/'],
							{at, index}  = getAtAndIndex(text, atItems);
							this.isTyping = true;
							
							toggleResults( "hide", resultWrapper);

							const vthis = _vthis.children[0];

							
							if(index < 0) return; //if user hasnt pressed the sign..

							if( shouldActivate(vthis) && this.backspacing == false){ this.endCaret=null; this.startCaret=null; this.theValue=null;  this.ind = index; }

							if( getAtAndIndex( text.slice(index+1), notAllowed ).index > 0 ) return;

							if(text.slice(index+1).length < 2) return;

							this.endCaret = selectionCharcterOffset(vthis).end; this.startCaret = selectionCharcterOffset(vthis).end

							if(this.backspacing == true) this.backspacing = false;

							if(this.backspacing == false) this.theValue =  text.slice(index+1);
							
							if(this.theValue == null) this.theValue = text.slice(index+1);
							
							if(this.theValue != null || this.backspacing == true){
								//emiting the thevalue to the parent components... and I'm listening with watcher...

								this.$root.$emit(this.eventname, { at: at, value: this.theValue } );

								if(this.matches){
									let that =  this;
									setTimeout( function(){
										displayMatches( that.matches, resultWrapper, that.cursorPosition );
									}, 15);
									//go to atinput...
									
								}
							}
							
							//alter this with a regular expression
							if(text.length == 0 || e.data == 'Escape' || e.data == ',' || e.data == '%' || e.data == '/' && ( e.data == ' ' && at == '@' )){
								toggleResults( "hide", resultWrapper);
								this.backspacing = false; this.ind = null; this.endCaret = null; this.matches =  '';
								this.startCaret = null; resultWrapper.innerHTML=null;
							}

							if(e.data == ' ' && at == '#'){
									var obj = { selValue:this.theValue, endCaret: this.endCaret, ind: this.ind, theValue: this.theValue };

									handleInsert(e.path[0], obj);

									this.cursorPosition = 0; this.endCaret = null; this.ind = null; this.theValue = null; this.startCaret = null;
									toggleResults( "hide", resultWrapper ); this.backspacing = false
							}

							for (var i = 0; i < resultWrapper.children.length; i++){

								const range = getRange(), {at, index} = getAtAndIndex(getPrecedingRange().toString(), ['@', '#']);

								resultWrapper.children[i].onclick = function(e){

									var selValue = this.children[1].innerHTML;
									var obj = {	selValue:selValue, endCaret:that.endCaret, ind:that.ind, theValue:that.theValue, range:range };

									var atag = document.createElement('a'), aspan = document.createElement('span');

										atag.innerText = at+selValue; atag.id = selValue.trim(); 
										atag.className ='userMention user_mentions';

										if(at == '@')
											atag.href ='/xs/'+selValue;
										if(at == '#')
											atag.href ='/hashtags/'+at+selValue;

										//atag.href = atag.baseURI + at+selValue;
										atag.innerHTML.trim(); aspan.innerHTML.trim(); aspan.appendChild(atag);

										if(vthis.hasChildNodes() && vthis.childNodes.length > 1){
											//selectUserInput(range.commonAncestorContainer, obj)
											clickSelect( range.commonAncestorContainer, obj)
										}
										if(vthis.childNodes.length == 1){
											//selectUserInput(vthis.childNodes[0], obj)
											clickSelect( vthis.childNodes[0], obj)
										}
										document.execCommand('insertHTML', false, "&nbsp;");
			    						range.insertNode(aspan); 
										setCursor( vthis, aspan );
										document.execCommand('insertHTML', false, '&nbsp;');

										that.cursorPosition = 0; that.endCaret = null; that.ind = null; that.theValue = null; that.startCaret = null;
										toggleResults( "hide", resultWrapper );that.backspacing = false;that.matches = [];

								}

							}
				
				},

			handleKeyup(e)
				{
					var resultWrapper = document.getElementById( this.atresultWrapper );
					//e.path[0] === this.$refs.mainwrap

					if( resultWrapper.classList.contains( "visible" ) ){
						switch(e.keyCode){
							case 13:
								e.stopPropagation();e.preventDefault();

								var selValue = getChildValue(resultWrapper, this.cursorPosition)

								var obj = {
									selValue:selValue, endCaret: this.endCaret,
									ind: this.ind, theValue: this.theValue
								}
								handleInsert(e.path[0], obj);

								this.cursorPosition = 0; this.endCaret = null; this.ind = null; this.theValue = null; this.startCaret = null;
								toggleResults( "hide", resultWrapper ); this.matches = null; this.backspacing = false;
								
								break;

							case 38:
								e.stopPropagation()
								e.preventDefault()
								if(this.cursorPosition > 0){
									this.cursorPosition--
									moveCursor( this.cursorPosition, resultWrapper)
								}
								//when user is moving reset the caret to its normal position...
								break;

							case 40:
								e.preventDefault()
								e.stopPropagation()
								if(this.cursorPosition < ( this.matches.length-1 )){
									this.cursorPosition++
									moveCursor( this.cursorPosition, resultWrapper)
								}
								return false;
								break;
							}
					}

					const text = getPrecedingRange().toString(), atItems = ['@', '#'];

					const {at, index} =  getAtAndIndex(text, atItems);

					if(typeof varTamp != "undefined" && !(index < 0) && e.keyCode == 8){
						this.theValue =  text.slice(index+1);
						if(this.theValue.length < 4) return;
						this.endCaret =  selectionCharcterOffset(e.path[0]).end;
						this.startCaret = index;this.backspacing = true;
					}
				},

			handleKeydown(e)
				{ 
					const txt = e.path[0], resultWrapper = document.getElementById(this.atresultWrapper);
					this.isTyping = true

					if(e.keyCode == 13){ e.preventDefault(); e.stopPropagation(); return; }

					if(resultWrapper.classList.contains( "visible" ) && (e.keyCode == 38 || e.keyCode == 40)){
						e.preventDefault();
					}
					this.txtContent = txt.innerHTML
					
				},
			
		}
	}
</script>

<template>

	<div>
		<div ref="mainwrap" @input="handleInput" @keydown="handleKeydown" @keyup="handleKeyup">
			<slot></slot>
			<div class="autocompletion z-depth-2 cursor" :id=atresultWrapper></div>
		</div>
	</div>

</template>

<style>
	@import url('./style.css');

	.card .card-action a:not(.btn):not(.btn-large):not(.btn-large):not(.btn-floating) {
     margin-right: 0px !important;
 	}
</style>