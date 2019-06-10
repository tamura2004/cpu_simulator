// Deburis: minimal decimal cpu simulator for study
var MEMORY_SIZE = 48;
var INITIAL_B = 30;
var INITIAL_C = INITIAL_B + 1;

var MEMORY = [];
for(var i = 0; i < MEMORY_SIZE; i++){
  MEMORY.push({
    id: i,
    val: 0
  });
}

var OPECODE = [
  {'cmd':'NOP', 'sample':'-', 'desc':'何もしない'},
  {'cmd':'LD x y', 'sample':'x = y', 'desc':'xにyを代入する'},
  {'cmd':'INC x', 'sample':'x++', 'desc':'xの値を1増加させる'},
  {'cmd':'DEC x', 'sample':'x--', 'desc':'xの値を1増加させる'},
  {'cmd':'ADD x y', 'sample':'x = x + y', 'desc':'足し算を行う'},
  {'cmd':'PUSH x', 'sample':'M[SP--] = x', 'desc':'スタックの先頭に値を保存する'},
  {'cmd':'POP x', 'sample':'[++SP] = x', 'desc':'スタックの先頭から値を取り出す'},
  {'cmd':'JMP n', 'sample':'[PC] = n', 'desc':'次の処理は、アドレスnから開始する'},
  {'cmd':'CALL n', 'sample':'method(A)', 'desc':'サブルーチン呼び出し'},
  {'cmd':'RET', 'sample':'return A', 'desc':'CALLで呼び出された場所に戻る'},
  {'cmd':'HALT', 'sample':'-', 'desc':'処理を停止する'}
];

var NIMONIC = [
 'NOP',
 'LD A B',
 'LD A C',
 'LD B C',
 'LD C B',
 'LD A [B]',
 'LD A [C]',
 'LD A n',
 'LD B [B]',
 'LD B [C]',
 'LD B n',
 'LD C [B]',
 'LD C [C]',
 'LD C n',
 'LD [B] A',
 'LD [B] B',
 'LD [B] C',
 'LD [C] A',
 'LD [C] B',
 'LD [C] C',
 'JMP n',
 'JMP NC n',
 'JMP NZ n',
 'CMP A B',
 'CMP A C',
 'CMP A n',
 'CMP B n',
 'CMP C n',
 'CMP [B] [C]',
 'EX [B] [C]',
 'ADD A B',
 'ADD A C',
 'ADD A n',
 'INC A',
 'INC B',
 'INC C',
 'DEC A',
 'DEC B',
 'DEC C',
 'PUSH A',
 'PUSH B',
 'PUSH C',
 'POP A',
 'POP B',
 'POP C',
 'RET',
 'CALL n',
 'HALT'
]

var ASSEMBLE = {}

for(var i = 0; i < NIMONIC.length; i++){
  ASSEMBLE[NIMONIC[i]] = i;
}

new Vue({
  el: "#app",
  data: {
    name: "debris",
    pc: 0,
    sp: MEMORY_SIZE-1,
    a: 0,
    b: INITIAL_B,
    c: INITIAL_C,
    zero: false,
    carry: false,
    halt: true,
    message: [],
    code: '',
    msg: '',
    opecode: 0,
    operand: 0,
    reg: '',
    addr: 0,
    val: 0,
    nimonic: '',
    ast: {
      code: '',
      dst: '',
      src: '',
      length: 0,
    },
    params: [],
    labels: {},
    codesize: 0,
    ms: MEMORY,
    table: NIMONIC,
    reverse: ASSEMBLE,
    opecodes: OPECODE,
  },

  methods: {
    shuffle: function(array) {
      var n = array.length, t, i;
      while(n) {
        i = Math.floor(Math.random() * n--);
        t = array[n];
        array[n] = array[i];
        array[i] = t;
      }
      return array;
    },

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
      this.b = INITIAL_B;
      this.c = INITIAL_C;
      this.halt = false;
      this.zero = false;
      this.carry = false;
      this.sp = MEMORY_SIZE-1;
      this.message = [];
    },

    set_random: function(){
      for(var i = INITIAL_B; i < MEMORY_SIZE; i++){
        this.set_memory(i,Math.floor(Math.random()*MEMORY_SIZE));
      }
    },

    set_seqdata: function(){
      for(var i = INITIAL_B; i < MEMORY_SIZE; i++){
        this.set_memory(i,Math.floor(i/2));
      }
    },

    set_linklist: function(){
      var addr = [];
      for(var i = 1; i < 6; i++){
        addr.push(i);
      }
      addr = this.shuffle(addr);

      var b = INITIAL_B;
      for(var i = 0; i < addr.length; i++){
        next = addr[i] * 2 + INITIAL_B;
        this.set_memory(b, next);
        this.set_memory(b+1, Math.floor(Math.random() * MEMORY_SIZE));
        b = next;
      }
      this.set_memory(b,0);
      this.set_memory(b+1,0);
    },

    add: function(a,b){
      if (this.params[0] != 'POP') {
        this.zero = false;
        this.carry = false;

        if((a+b)%MEMORY_SIZE==0){
          this.zero = true;
        }else if(a+b>=MEMORY_SIZE){
          this.carry = true;
        }
      }
      return (a+b)%MEMORY_SIZE;
    },

    sub: function(a,b){
      if (this.params[0] != 'PUSH') {
        this.zero = false;
        this.carry = false;

        if(a == b){
          this.zero = true;
        }else if(a < b){
          this.carry = true;
        }
      }
      return (a-b+MEMORY_SIZE)%MEMORY_SIZE;
    },

    cmp: function(a,b){
      this.zero = false;
      this.carry = false;

      if(a == b){
        this.zero = true;
      }else if(a < b){
        this.carry = true;
      }
    },

    inc: function(name){
      this.set(name, this.add(this.get(name), 1));
    },

    inc_pc: function(){
      if(this.pc == MEMORY_SIZE-1){
        this.pc = 0;
        return true;
      }else{
        this.pc ++;
        return false;
      }
    },

    dec: function(name){
      this.set(name, this.sub(this.get(name), 1));
    },

    get: function(name){
      switch(name){
        case 'n':
          return this.operand;

        case 'A':
        case 'B':
        case 'C':
        case 'SP':
        case 'PC':
          return this.get_register(name);

        case '[B]':
        case '[C]':
          return this.get_memory(this.get(name.substr(1,1)));

        case '[SP]':
          return this.get_memory(this.get(name.substr(1,2)));

        default:
          return null;
      }
    },

    set: function(name,val){
      switch(val){
        case 'n':
        case 'A':
        case 'B':
        case 'C':
        case 'SP':
        case 'PC':
        case '[B]':
        case '[C]':
        case '[SP]':
          val = this.get(val);
      }
      
      switch(name){
        case 'A':
        case 'B':
        case 'C':
        case 'SP':
        case 'PC':
          this.set_register(name,val);
          break;

        case '[B]':
        case '[C]':
          return this.set(this.get(name.substr(1,1)),val);
          break;

        case '[SP]':
        case '[PC]':
          return this.set(this.get(name.substr(1,2)),val);
          break;

        default:
          return this.set_memory(name,val);
      }
    },

    get_register: function(name){
      return this[name.toLowerCase()];
    },

    get_memory: function(addr){
      return Number(this.ms[addr].val);
    },

    set_register: function(name,val){
      this[name.toLowerCase()] = val;
    },
    
    set_memory: function(addr,val){
      this.ms[addr].val = Number(val);
    },

    check_condition: function(){
      switch(this.params[1]){
        case 'Z':
          return this.zero;

        case 'NZ':
          return !this.zero;

        case 'C':
          return this.carry;

        case 'NC':
          return !this.carry;

        default:
          return true;
      }
    },

    push: function(name){
      this.set('[SP]',this.get(name));
      this.dec('SP');
    },

    pop: function(name){
      this.inc('SP');
      this.set(name,this.get('[SP]'));
    },

    fetch: function(){
      this.opecode = this.get_memory(this.pc);
      this.inc_pc();

      this.nimonic = this.table[this.opecode] || "HALT";
      this.msg = this.nimonic;
      this.params = this.nimonic.split(' ');

      // オペランドの読み込み
      if(this.params[2] == 'n' || this.params[1] == 'n'){
        this.operand = this.get_memory(this.pc);
        this.inc_pc();
        this.msg = this.msg.replace(/n$/,this.operand);
      }else{
        this.operand = null;
      }
    },

    export: function(){
      this.pc = 0;
      var codes = [];

      while(this.pc < INITIAL_B){
        var pc = this.pc;
        this.fetch();
        if(this.msg != 'NOP'){
          codes.push(String(pc) + ":" + this.msg);
        }
      }
      if(codes.length == 0){
        codes.push("エクスポートするコードがありません");
      }
      this.pc = 0;
      this.code = codes.join("\n");
    },

    import: function(){
      this.reset_memory();
      this.reset_register();
      this.pc = 0;

      var lines = this.code.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/^\d+:/,"") // 行番号を取り除く

        if (line == ""){
          continue; // 空行はスキップ
        }

        this.nimonic = line.toUpperCase().replace(/\d+$/,'n'); // 末尾の数字をnに変換
        this.params = line.split(' ');

        this.opecode = ASSEMBLE[this.nimonic]
        if (!this.opecode) {
          this.add_message('不明な命令です：' + line);
          continue;
        }

        this.set('[PC]', this.opecode);
        this.inc_pc();

        if (this.nimonic.match(/n$/)) {
          var len = this.params.length;
          if (len < 2 || 3 < len) {
            this.add_message('不正な命令長：' + line);
            continue;            
          }
          this.operand = this.params[len-1];
          this.set('[PC]', this.operand);
          this.inc_pc();
        }
      }
      this.pc = 0;
    },

    reset_memory: function(){
      for(var i = 0; i < MEMORY_SIZE; i++){
        this.ms[i].val = 0;
      }
    },

    add_message: function(msg){
      this.message.push(msg);
      var t = $("textarea#cpu_message");
      t.animate({
        scrollTop: t[0].scrollHeight - t.height()
      }, 100);
    },

    execute_all: function(){
      this.halt = false;
      var loop = function(){
        this.execute();
        if(this.halt){
          this.add_message("CPUを停止しました");
        }else{
          setTimeout(loop,300);
        }
      }.bind(this);
      loop();
    },

    execute: function(event){
      this.fetch();
      this.add_message(this.msg)

      var p1 = this.params[1];
      var p2 = this.params[2];
      var v1 = this.get(p1);
      var v2 = this.get(p2);

      switch(this.params[0]) {
        case 'NOP':
          break;

        case 'HALT':
          this.halt = true;
          break;

        case 'PUSH':
          this.push(p1);
          break;

        case 'POP':
          this.pop(p1);
          break;

        case 'INC':
          this.inc(p1);
          break;

        case 'DEC':
          this.dec(p1);
          break;

        case 'LD':
          this.set(p1,v2);
          break;

        case 'EX':
          this.set(p1,v2);
          this.set(p2,v1);
          break;

        case 'ADD':
          this.set(p1,this.add(v1, v2));
          break;

        case 'SUB':
          this.set(p1,this.sub(v1, v2));
          break;

        case 'CMP':
          this.cmp(v1, v2);
          break;

        case 'JMP':
          if(this.check_condition(p1)){
            this.set('PC', this.operand);
          }
          break;
          
        case 'CALL':
          this.push('PC');
          this.push('C');
          this.push('B');
          this.push('A');
          this.set('PC', this.operand);
          break;

        case 'RET':
          this.pop('A');
          this.pop('B');
          this.pop('C');
          this.pop('PC');
          break;

        default:
          this.add_message("無効な命令です");
      }
    }
  }
});
