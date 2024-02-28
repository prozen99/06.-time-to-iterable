// range와 take의 재해석.
_.go(
  _.range(10), //  0 부터 9까지의 배열
  _.take(3), //  앞에서부터 3개만 자르기
  _.each(console.log));

_.go(
  L.range(1, 10), //  0 부터 9까지의 이터러블, 최대 10번 일어날 일
  L.map(_.delay(1000)), // L.map(n=>_.delay(500*n,n)), 이런식으로도 표현가능.
  L.filter(a => a % 2),
  L.map(_ => new Date()),
  _.take(3), //  최대 3개의 값을 필요하고, 최대 3번의 일을 수행
  _.each(console.log));

  //iterable은 결국 if for 와 같은 logic을 넘어서서 
  // 문법적으로 대체가 가능한 부분이라는것을 이해하는것이 
  // 이 강의의 핵심이다.

//2. takeWhile , takeUntil
  _.go(
    [1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0],
    L.takeWhile(a => a), // true인값만 뽑아 낼 거니까 여기서는 1~8 false=0임
    _.each(console.log));
  
  _.go(
    [1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0],
    L.takeUntil(a => a), // until ~까지 니까  a=>a라는건 처음으로 true를 만나는떄까지 담음.
    _.each(console.log));
  
  _.go(
    [0, false, undefined, null, 10, 20, 30],
    L.takeUntil(a => a),
    _.each(console.log));
  

//3. 할 일들을 이터러블(리스트)로 바라보기

const track = [
  { cars: ['철수', '영희', '철희', '영수'] },//1조
  { cars: ['하든', '커리', '듀란트', '탐슨'] },//2조
  { cars: ['폴', '어빙', '릴라드', '맥컬럼'] },//3조
  { cars: ['스파이더맨', '아이언맨'] }, //4조
  { cars: [] }
];

_.go(
  L.range(Infinity), // 언제 끝날지는 모르는 상태까지 함 . 무한루프에서 break 쓰는거 
  //iterable 관점에서 본거임 
  L.map(i => track[i]), // L.map i=>track[i] i라는 값이오면 track[i]를 꺼내오는거임
  //뭐 만약 i가2면 '하든' ,'커리 ' , '듀란트' ,'탐슨' 을 뽑아오는 절차라고 생각하면됨.
  L.map(({cars}) => cars), // 배열 하나만 뽑아 내는거임 . 
  L.map(_.delay(2000)),
  L.takeWhile(({length: l}) => l == 4), // cars도 객체인데 내부 배열에서 
  // 원소의 개수가 4개인것만 이라는 의미임 지금.
  // L.takeUntil(({length: l}) => l < 4), 4명이 안찬 처음까지 출발 
  // 스파이더맨 , 아이언맨이 있는데 2명 까지는 출발하게됨.
  L.flat,// 값이 나올때 뭔가 문자열 처럼 나오게함 . 배열 형식이 아니라 .
  L.map(car => `${car} 출발!`),
  _.each(console.log));






  //4. 아임포트 결제 누락 스케쥴러 만들기

  const Impt = {
    payments: {
      1: [
        { imp_id: 11, order_id: 1, amount: 15000 },
        { imp_id: 12, order_id: 2, amount: 25000 },
        { imp_id: 13, order_id: 3, amount: 10000 }
      ],
      2: [
        { imp_id: 14, order_id: 4, amount: 25000 },
        { imp_id: 15, order_id: 5, amount: 45000 },
        { imp_id: 16, order_id: 6, amount: 15000 }
      ],
      3: [
        { imp_id: 17, order_id: 7, amount: 20000 },
        { imp_id: 18, order_id: 8, amount: 30000 }
      ],
      4: [],
      5: [],
      //...
    },
    getPayments: page => {
      console.log(`http://..?page=${page}`); //http에 요청하는것을 흉내내는거임 
      return _.delay(1000 * 1, Impt.payments[page]);//뭐 위에 payments에
      //1,2,3,4,5 와 같이 각각의 결제 정보가 담긴 번호가 있는데 그 번호에
      // 맞는 값을 가져옴.
    },
    cancelPayment: imp_id => Promise.resolve(`${imp_id}: 취소완료`)
  };
  
  const DB = {
    getOrders: ids => _.delay(100, [
      { id: 1 },
      { id: 3 },
      { id: 7 }
    ])
  };
  
  async function job() {
    // 결제된 결제모듈측 payments 가져온다.
    // page 단위로 가져오는데,
    // 결제 데이터가 있을 때까지 모두 가져와서 하나로 합친다.
    const payments = await _.go(
      L.range(1, Infinity),//1번부터 시작해서 무한대까지.
      L.map(Impt.getPayments),// page 값이 들어오면 1,2 이렇게 하나씩 늘게됨 
      L.takeUntil(({length}) => length < 3),//길이가 처음으로 3보다 작을때까지 하나뽑아옴
      _.flat);
  
    // 결제가 실제로 완료된 가맹점 측 주문서 id들을 뽑는다.
    const order_ids = await _.go(
      payments,// Impt의 객체 payments를 가져옴 
      _.map(p => p.order_id),//그 payment의 order id 를 뽑아옴 
      DB.getOrders,
      _.map(({id}) => id));
  
    // 결제모듈의 payments와 가맹점의 주문서를 비교해서
    // 결제를 취소해야할 id들을 뽑아서
    // 결제 취소 api를 실행
    await _.go(
      payments,
      L.reject(p => order_ids.includes(p.order_id)),//p.order_id가 order_ids에 포함되어
      //있느냐? 포함되어있는 값은 취소되면 안되니까 걸러내겠다.
      L.map(p => p.imp_id),
      L.map(Impt.cancelPayment),
      _.each(console.log));
  }
  
  // 5초에 한 번만 한다.
  // 그런데 만일 job 7초보다 더 걸리면, job이 끝날 때까지
  (function recur() {
    Promise.all([
      _.delay(7000, undefined),
      job() //계속 연속적으로 실행하기 위해서  재귀를 거는 느낌이고
    ]).then(recur); 
  }) (); // 여기서 함수 앞에 () 로 묶는거는 즉시 실행을 말하는거임.
