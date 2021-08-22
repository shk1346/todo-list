/**
 * 
 */

/* 현재 시간을 그려주는 함수*/
let renderCurrentTimer = () => {
	
	/* 현재 시간을 받자 */
	let now = new Date();
	let hour = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();
	
	/* 시간이 한 자리 숫자일 땐 앞에 0이 붙어서 출력되도록 */
	hour = hour < 10?"0"+hour:hour;
	minutes = minutes < 10?"0"+minutes:minutes;
	seconds = seconds < 10?"0"+seconds:seconds;
	/* .txt_clock 인 곳의 데이터를 받아옴 */
	document.querySelector('.txt_clock').innerHTML = `${hour} : ${minutes} : ${seconds}`;
	
}


/* 입력하고 submit하면 화면이 바뀌어야함
	1. placeholder의 문구를 바꿔준다. 
	2. eventListener 우리가 입력한 데이터를 화면에 뿌려주고, localStorage에 저장	
*/
let renderUser = (event) => {
	
	//HTML요소의 기본 이벤트 중지 
	event.preventDefault();
	
	console.dir('registSchedule : ' + event.target.className);
	//사용자가 입력한 값(사용자이름)을 받아
	 let input = document.querySelector('.inp_username').value;
	/* 사용자 이름을 localStorage에 넣기 */
	localStorage.setItem('username', input); //input=username
	convertMainDiv(input);
}

//일정 등록하는 함수(데이터추가)
let registSchedule = (event) => {
	
	//HTML요소의 기본 이벤트 중지 *********시험에 나올 수 있음
	event.preventDefault();
		
	console.dir('registSchedule : ' + event.target.className);
	
	let prevTodo = localStorage.getItem('todo'); //이전사용자가 todo list를 등록한 적이 있는지
	let input = document.querySelector('.inp_todo').value;
	let todoList = [];
	
	
	if(prevTodo){ //prevTodo가 true라면 = 이전사용자가 todo list를 등록한 적이 있다면
		todoList = JSON.parse(prevTodo); //object로 변환
		let idx = Number(localStorage.getItem('lastIdx')) + 1;
		localStorage.setItem('lastIdx',idx); //1씩 증가하는 idx를 식별자로 가지게
		todoList.push({work:input, idx:idx}); // todoList 배열 가장 처음에 추가 unshift(), 마지막에 추가 push()
		
	}else{ //아니라면 새롭게 추가
		localStorage.setItem('lastIdx',0); 
		todoList.push({work:input, idx:0});  //처음일 땐 식별자=0
	}
	
	//localStorage에 객체로 저장하자(JSON형태의 string타입으로 으로 변환하여)
	//'todo'라는 key에 데이터(JSON.stringify(todoList))를 저장한다.
	localStorage.setItem('todo',JSON.stringify(todoList)); 
	
	renderSchedule(todoList.slice(0,8)); //새롭게 정보를 추가해도 8개의 정보만 출력되도록 slice() 사용하기
	
	
}

let removeSchedule = event =>{
	let curPage = Number(document.querySelector('#currentPage').textContent);
	let todoList = JSON.parse(localStorage.getItem('todo'));

	let removedList = todoList.filter(e => {
		return event.target.dataset.idx != e.idx; //i태그의 식별자와 같지 않은 애만 반환
	});
	
	console.dir(removedList);
	//여기까진 삭제 완료우
	localStorage.setItem('todo',JSON.stringify(removedList));
	
	let end = curPage * 8; //랜더링해야되는 페이*8만큼 
	let begin = end - 8;
	renderSchedule(removedList.slice(begin, end));
}


let renderSchedule = (todoList) => { //생성하는 시점
	
	//remove()를 사용해서 해야 할 일들이 목록에 하나씩만 생성되도록
	document.querySelectorAll('.todo-list>div').forEach(e => {e.remove()});
	document.querySelector('.inp_todo').value = '';
	
	// Your Work쪽에 뿌려질 수 있도록 해보자
	todoList.forEach(schedule => { 
		let workDiv = document.createElement('div'); //div생성
		workDiv.innerHTML = `<i class="fas fa-trash-alt" data-idx="${schedule.idx}"></i> ${schedule.work}`; //id를 갖다 쓸 수 있게 data-idx추가
		document.querySelector('.todo-list').append(workDiv); //이렇게 하면 style로 값을 잡아줄 수 있음
		
	});
	
	document.querySelectorAll('.todo-list>div').forEach(e =>{
		e.addEventListener('mouseover', ()=>{
			e.style.backgroundColor = "grey";
		})
		e.addEventListener('mouseout', ()=>{
			e.style.backgroundColor = "transparent";
		})
		e.addEventListener('click', ()=>{
			e.style.textDecoration = "line-through";
			e.style.textDecorationStyle = "double";
			e.style.textDecorationColor = "red";
		})
	})
	
	document.querySelectorAll('.todo-list>div>i').forEach(e =>{
		e.addEventListener('click', removeSchedule)
	})
}

//dir : 방향
let renderPagination = (event) =>{
	
	let dir = Number(event.target.dataset.dir);
	// 미리 생각해둘 데이터들!
	//1. 현재페이지 값 (<span>1</span>에 들어있음)
	let curPage = Number(document.querySelector('#currentPage').textContent); 
	let lastPage;
	let renderPage = curPage + dir; //dir은 -1 또는 +1 (이전페이지, 다음페이지)
	
	//2. 전체페이지수 
	let todoList = localStorage.getItem('todo');
	if(todoList){ //todoList가 존재한다면
		todoList = JSON.parse(todoList);
		let todoCnt = todoList.length;  
		lastPage = Math.ceil(todoCnt/8); 
	}
	
	//사용자가 마지막 페이지를 보고 있다면 다음 페이지로 넘어가면 안됨
	if(renderPage > lastPage){
		alert('마지막 페이지입니다.');
		return;
	}
	
	if(renderPage < 1){
		alert('첫번째 페이지입니다.');
		return;
	}
	
	//3. 페이지당 뿌릴 데이터 숫자
	//마지막 페이지가 아니라면 다음 페이지가 보여지도록
	
	let end = renderPage*8; 
	let begin = end-8;
	
	renderSchedule(todoList.slice(begin, end));
	document.querySelector('#currentPage').textContent = renderPage;
}



let convertMainDiv = (username) => { 

	document.querySelector('.username').innerHTML = username;
	document.querySelector('.inp_username').placeholder = 'Enter your schedule';
	document.querySelector('.inp_username').value = '';
	
	//로그인이 된 상황에 class명을 바꿔주자 (로그인 전과 후의 화면을 다르게 하기 위해)
	document.querySelector('.wrap_username').className = 'box_todo';
	document.querySelector('.frm_username').className = 'frm_todo';
	document.querySelector('.inp_username').className = 'inp_todo';
	
	//convertMainDiv가 동작하는 시점(로그인되었을때)에 바꿀 것들을 css가 아닌 여기에 작성(camel표기법으로 작성해야됨)
	document.querySelector('.main').style.justifyContent = 'space-between';
	document.querySelector('.wrap_todo').style.marginRight = '20vw';
	document.querySelector('.todo-list').style.display = 'block';
	
	//eventListener가 두 개가 붙으면 오류가 생기기 때문에 renderUser의 이벤트를 지워주자
	document.querySelector('.frm_todo').removeEventListener('submit', renderUser);//기존에 등록한 submit이벤트 제거
	//callback함수를 호출하는 addEventListener 
	document.querySelector('.frm_todo').addEventListener('submit', registSchedule);
	//화살표 아이콘에 click이벤트
	document.querySelector('#leftArrow').addEventListener('click', renderPagination);
	document.querySelector('#rightArrow').addEventListener('click', renderPagination);
	
	
}


/* 전역변수를 보호하기 위해 즉시실행함수를 만들자 */
(()=>{
	
	/*인덱스가 호출되는 시점에 main.js가 호출될 거니까*/
	let username = localStorage.getItem('username');
	let todoList = localStorage.getItem('todo');
	
	console.log(username, todoList);
	
	if(username){ 

			convertMainDiv(username);
			
			if(todoList){
				todoList = JSON.parse(todoList);
				renderSchedule(todoList.slice(0,8)); 
			}
	}else{
		document.querySelector('.frm_username').addEventListener('submit', renderUser);
	}
	
	//시간이 1초씩 흐르게
	setInterval(renderCurrentTimer,1000);
})();



