/**
 * 
 */

/* 우리 위치 가져오는 코드 */
let getCoords = () => {
	
	return new Promise((resolve,reject)=>{
		navigator.geolocation.getCurrentPosition((position)=>{
			resolve(position.coords); 
		});
	})
}

/* 날씨정보를 받는 함수 */
let getLocationWeather = async () =>{
	
	let coords = await getCoords();
	
	let queryString = createQueryString({
		lat:coords.latitude,
		lon:coords.longitude,
		units:'metric',
		lang:'kr',
		appid:'7f64876434eb873a57c47fa3ba10e58c'
	});
	
	let url = `https://api.openweathermap.org/data/2.5/weather?${queryString}`;
	let response = await fetch(url);
	let datas = await response.json();
	
	console.log(datas);
	/* 미리 데이터를 가공해서 보내면 편함 */
	return {
		temp:datas.main.temp,
		loc:datas.name
	}	
}


/* 배경사진을 받는 함수 */
let getBackgroundImg = async () => {
	
	//원래는 새로고침을 할 때마다 배경사진이 바뀌었는데 하루동안은 같은 사진이 유지되도록 하자 -> 데이터만료시간이 현재시간보다 클 때 바뀌도록
	//이전 backgroundlog에 bg-log라는 key값을 가지고 있는 곳에 
	let prevLog = localStorage.getItem('bg-log');
	
	if(prevLog){ //사용자가 처음 접근하지 않았다면(local머시기에 기록이 남아있다면 true,처음 접근하는거라면 null이기때문에 false)
		prevLog = JSON.parse(prevLog) ; //JSON 문자열로 변환한 걸 다시 객체로 바꿔서 받음
		if(prevLog.expirationOn > Date.now()){ //만료일자가 현재일자보다 크다면
			return prevLog.bg;
		}
	}
	
	//새로운 배경사진을 받음
	let imgInfo = await requestBackgroundImage(); //역할분리 async함수를 await으로 받음
	
	registBackgroundLog(imgInfo); //역할분리 registBackgroundLog 함수를 만들어서 여기에 호출
	
	return imgInfo;
	
	/*console.dir(datas);*/
	
}

let requestBackgroundImage = async () =>{ 
	
	let queryString = createQueryString({
		orientation:'landscape',
		query:'landscape'
	});
	
	let url = 'https://api.unsplash.com/photos/random?'+queryString;
	/* Authorization: Client-ID YOUR_ACCESS_KEY */
	let response = await fetch(url, {
		headers:{Authorization : 'Client-ID FbIn7lZX5jwdcasOXr-12kMIT6-PDYewkZgnq-9gEO8'}
	});
	
	let datas = await response.json();
	
	return {
		url:datas.urls.regular,
		desc:datas.description
	}
}


let registBackgroundLog = imgInfo =>{
	
	//통신이 끝난 시간
	let expirationDate = new Date(); //현재 시간 가져옴
	expirationDate = expirationDate.setDate(expirationDate.getDate()+1); //Date.prototype.setDate() : 현지 시간 기준으로 분을 설정합니다.
	//만료시간은 현재 날짜의 +1 만큼 정해주자. 하루가 지나면 바뀌도록
	let bgLog = { 
		expirationOn : expirationDate,
		bg: imgInfo
	}
	
	localStorage.setItem('bg-log', JSON.stringify(bgLog)); //JSON을 문자열로 변환하여 localStorage에 저장
	
}


/* async함수는 실행결과로 함수의 리턴값을 결과값으로 가지는 Promise를 반환한다. 
	await으로 async함수를 실행하면 위의 함수들이 반환하는 리턴값을 바로 가질 수 있다.	
*/

/* 필요한 데이터들을 반환하는 함수*/
let renderBackground = async () => {
	
	//위치와 날씨정보를 받아온다
	let locationWeather = await getLocationWeather(); /* getLocationWeather라는 async함수가 반환하는 resolve값을 locationWeather변수가  받음*/
	
	/* 화면에 위치와 날씨정보를  뿌려준다  */
	document.querySelector('.txt_location').innerHTML = `${locationWeather.temp}º @${locationWeather.loc}`;
	
	//배경에 넣을 이미지를 받아온다
	let background = await getBackgroundImg();
	//배경에 이미지와 이미지정보를 그려준다.
	document.querySelector('body').style.backgroundImage = `url(${background.url})`;
	
	/* 배경사진 description 추가
	description이 null인 사진도 있으므로  조건문으로 거르자*/
	if(background.desc){ /* description이 null이 아니라면 description추가하고 null이면 원래 지정한 문구 출력 */
		document.querySelector('.txt_bg').innerHTML = background.desc;
	}
}


renderBackground();


