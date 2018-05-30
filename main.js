// Deburis: minimal decimal cpu simulator for study

var MEMORY = []
for(var i = 0; i < 40; i++){
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
  {'cmd':'SUB x y', 'sample':'x = x - y', 'desc':'引き算を行う'},
  {'cmd':'PUSH x', 'sample':'x -> [SP--]', 'desc':'スタックの先頭に値を保存する'},
  {'cmd':'POP x', 'sample':'x <- [++SP];', 'desc':'スタックの先頭から値を取り出す'},
  {'cmd':'JMP n', 'sample':'goto n', 'desc':'次の処理は、アドレスnから開始する'},
  {'cmd':'CALL f', 'sample':'f()', 'desc':'サブルーチン呼び出し'},
  {'cmd':'RET', 'sample':'return', 'desc':'CALLで呼び出された場所に戻る'}
];

var NIMONIC = [
 'LD A B',
 'LD A C',
 'LD A [B]',
 'LD A [C]',
 'LD A n',
 'LD B A',
 'LD B C',
 'LD B [B]',
 'LD B [C]',
 'LD B n',
 'LD C A',
 'LD C B',
 'LD C [B]',
 'LD C [C]',
 'LD C n',
 'LD [B] A',
 'LD [B] B',
 'LD [B] C',
 'LD [B] [C]',
 'LD [B] n',
 'LD [C] A',
 'LD [C] B',
 'LD [C] C',
 'LD [C] [B]',
 'LD [C] n',
 'JMP E n',
 'JMP Z n',
 'JMP NZ n',
 'JMP C n',
 'JMP NC n',
 'RET E n',
 'RET Z n',
 'RET NZ n',
 'RET C n',
 'RET NC n',
 'CALL E n',
 'CALL Z n',
 'CALL NZ n',
 'CALL C n',
 'CALL NC n',
 'CMP A B',
 'CMP A C',
 'CMP A [B]',
 'CMP A [C]',
 'CMP A n',
 'CMP B A',
 'CMP B C',
 'CMP B [B]',
 'CMP B [C]',
 'CMP B n',
 'ADD A B',
 'ADD A C',
 'ADD A [B]',
 'ADD A [C]',
 'ADD A n',
 'ADD B A',
 'ADD B C',
 'ADD B [B]',
 'ADD B [C]',
 'ADD B n',
 'SUB A B',
 'SUB A C',
 'SUB A [B]',
 'SUB A [C]',
 'SUB A n',
 'SUB B A',
 'SUB B C',
 'SUB B [B]',
 'SUB B [C]',
 'SUB B n',
 'POP A',
 'POP B',
 'POP C',
 'PUSH A',
 'PUSH B',
 'PUSH C',
 'AND A B',
 'AND A C',
 'AND A [B]',
 'AND A [C]',
 'INC A',
 'INC B',
 'INC C',
 'DEC A',
 'DEC B',
 'DEC C',
 'OR A B',
 'OR A C',
 'OR A [B]',
 'OR A [C]',
 'EX A B',
 'EX B C',
 'EX A C',
 'EX A [B]',
 'EX A [C]',
 'EX B [B]',
 'EX B [C]',
 'EX C [B]',
 'EX C [C]',
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
    sp: 39,
    a: 0,
    b: 20,
    c: 0,
    zero: false,
    carry: false,
    halt: false,
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
    add: function(a,b){
      this.zero = false;
      this.carry = false;

      if((a+b)%100==0){
        this.zero = true;
      }else if(a+b>=100){
        this.carry = true;
      }
      return (a+b)%100;
    },

    sub: function(a,b){
      this.zero = false;
      this.carry = false;

      if(a == b){
        this.zero = true;
      }else if(a < b){
        this.carry = true;
      }
      return (a-b+100)%100;
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
      if(this.pc == 99){
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
          return this.get(this.get(name.substr(1,1)));

        case '[SP]':
          return this.get(this.get(name.substr(1,2)));

        default:
          return this.get_memory(name);
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
      return this.ms[addr].val;
    },

    set_register: function(name,val){
      this[name.toLowerCase()] = val;
    },
    
    set_memory: function(addr,val){
      this.ms[addr].val = val;
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

        case 'E':
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
      if(this.params[2] == 'n'){
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

      while(this.pc < 20){
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

    set_random: function(){
      for(var i = 20; i < 40; i++){
        this.set_memory(i,Math.floor(Math.random()*100));
      }
    },

    set_seqdata: function(){
      for(var i = 20; i < 40; i++){
        this.set_memory(i,99-i);
      }
    },

    import: function(){
      this.reset_memory();
      this.labels = {};
      var codes = this.code.split("\n");

      this.pc = 0;
      for (var i = 0; i < codes.length; i++) {
        this.set_ast(codes[i])

        if(this.ast.code == 'LABEL'){
          this.labels[this.ast.dst] = this.pc;
        }
        for (var i = 0; i < this.ast.length; i++){
          this.inc_pc();
        }
      }

      this.pc = 0;
      for (var i = 0; i < codes.length; i++) {
        this.set_ast(codes[i])
        if (this.ast.code == 'NULL'){
          continue;
        }

        this.opecode = this.reverse[this.nimonic];
        if(this.opecode){

          this.set('[PC]', this.opecode);
          this.inc_pc();

          if(this.nimonic.match(/n$/)){
            if(this.ast.dst.match(/^\d+$/)){
              this.set('[PC]', Number(this.operand));
            }else if(this.ast.dst.match(/^:.*$/)){
              this.set('[PC]', this.labels[this.ast.dst]);
            }
            this.inc_pc();
          }
        }
      }
      this.pc = 0;
    },

    set_ast: function(line) {
      if (line == ''){
        this.ast.code = 'NULL';
        this.ast.length = 0;
        return
      }

      this.nimonic = line.toUpperCase();
      this.nimonic = this.nimonic.replace(/^\d+:/,''); //行番号削除
      this.params = this.nimonic.split(' ');

      this.nimonic = this.nimonic.replace(/\d+$/,'n');
      this.nimonic = this.nimonic.replace(/:.*$/,'n'); // ラベルを変換

      if(this.params[0].match(/^:/)){
        this.ast.code = 'LABEL';
        this.ast.dst = this.params[0];
        this.ast.src = '';
        this.ast.length = 0;
      }else{
        this.ast.code = this.params[0];
        this.ast.dst = this.params[1];
        this.ast.src = this.params[2];
        if(this.nimonic.match(/n$/)){
          this.ast.length = 2;
        }else{
          this.ast.length = 1;
        }
      }
    },

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
      this.b = 20;
      this.c = 0;
      this.halt = false;
      this.zero = false;
      this.carry = false;
      this.sp = 39;
      this.message = [];
    },

    reset_memory: function(){
      for(var i = 0; i < 40; i++){
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

        case 'ADD':
          this.set(p1,this.add(v1, v2));
          break;

        case 'SUB':
          this.set(p1,this.sub(v1, v2));
          break;

        case 'CMP':
          p1,this.cmp(v1, v2);
          break;

        case 'JMP':
          if(this.check_condition(p1)){
            this.set('PC', this.operand);
          }
          break;
          
        case 'CALL':
          if(this.check_condition(p1)){
            this.push('A');
            this.push('PC');
            this.pc = this.operand;
          }
          break;

        case 'RET':
          if(this.check_condition(p1)){
            this.pop('PC');
            this.pop('A');
          }
          break;

        default:
          this.add_message("無効な命令です");
      }
    }
  }
});
