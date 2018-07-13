export function addDragScroll(){
	if(window.USER_CAN_TOUCH == true){
            setTimeout( function(){ dragscroll.reset()  }, 150 );
    }
}

export function closeModal(_modalId){
      document.getElementById(_modalId).classList.add( 'is-hidden' );
}

export function openModal( _modalId ){
	 document.getElementById( _modalId ).classList.remove("is-hidden");
}

export function loadingMainImg(imgId, removedClass, _img){
		//get the thumb image
		var thumb =  document.images[imgId],   mainImage =  new Image() // create an instance of the img tag

		mainImage.onload = function(){
			thumb.src =  typeImg(_img, 'main') // assign the main image to the thumb
		}

		setTimeout( function(){
			mainImage.src =  typeImg(_img, 'main') // assign the img
			console.log(thumb); console.log(imgId)
			thumb.classList.remove( removedClass ) //remove the bluring class
		}, 500)

		mainImage.src =  typeImg(_img, 'main') 
		thumb.classList.remove( removedClass )

}

export function fixHtmlText(_elId, _htmlText){
	if(!_htmlText){ _htmlText = ''; }
	var doc =  document.getElementById(_elId);
	doc.insertAdjacentHTML('beforeend', _htmlText);
}

export function typeImg(imgs, _type){
	return imgs[_type];
}

export function randVal(){
	return Math.random().toString().slice(3, 18);
}

export function toggleVisibility(rows, istyping, isfocus){
	if(rows < 3)
		return { rows: 3, isfocus: true, istyping: true };
}


export function userIsFollowing(celeb_id){
		
		axios.post('/is_following', {following_id: celeb_id})
			 .then( r => { 
			 	if( r.data == 1 ) 
			 		return  'home' ;
			 	else 
			 		return 'house';
			 })
}

export function follow(celeb_id){
	axios.post('/fllow', {following_id: celeb_id})
		 .then( r=> {	let a = false;  ( r.data == 1 ) ? a = true : a = false;  return a;
		 })
}

export function unfollow(celeb_id){
	axios.post('/unflow', { following_id: celeb_id })
		 .then( r => { let a = false;  ( r.data == 1 ) ? a = true : a = false;  return a;  })
	
}

export function matchesLoop(source, value){
	var matchlList = [], _match = null;

	for (var i = 0; i < source.length; i++) {

			if(source[i].username.toLowerCase().indexOf( value.value.toLowerCase() ) != -1 && Object.keys(matchlList).length <= 4){

				if(value.at == '@') _match =  { img: source[i].img, text: source[i].username};
		        if(value.at == '#')_match = { img: null, text: source[i].username};

				matchlList.push( _match);
				_match = null
			}

	}
	return matchlList;
	//just loop through the matches...
}