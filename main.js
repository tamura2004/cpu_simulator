// Deburis: minimal decimal cpu simulator for study

var MEMORY = []
for(var i = 0; i < 100; i++){
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

var NIMONIC = {
   0: 'NOP',
   1: 'LD A IX',
   2: 'LD A IY',
   3: 'LD A [IX]',
   4: 'LD A [IY]',
   5: 'LD A n',
   6: 'INC A',
   7: 'DEC A',
   8: 'PUSH A',
   9: 'POP A',
  10: 'LD IX A',
  12: 'LD IX IY',
  13: 'LD IX [IX]',
  14: 'LD IX [IY]',
  15: 'LD IX n',
  16: 'INC IX',
  17: 'DEC IX',
  18: 'PUSH IX',
  19: 'POP IX',
  20: 'LD IY A',
  21: 'LD IY IX',
  23: 'LD IY [IX]',
  24: 'LD IY [IY]',
  25: 'LD IY n',
  26: 'INC IY',
  27: 'DEC IY',
  28: 'PUSH IY',
  29: 'POP IY',
  30: 'LD [IX] A',
  31: 'LD [IX] IX',
  32: 'LD [IX] IY',
  34: 'LD [IX] [IY]',
  35: 'LD [IX] n',
  36: 'INC [IX]',
  37: 'DEC [IX]',
  38: 'PUSH [IX]',
  39: 'POP [IX]',
  40: 'LD [IY] A',
  41: 'LD [IY] IX',
  42: 'LD [IY] IY',
  43: 'LD [IY] [IX]',
  45: 'LD [IY] n',
  46: 'INC [IY]',
  47: 'DEC [IY]',
  48: 'PUSH [IY]',
  49: 'POP [IY]',
  50: 'ADD A A',
  51: 'ADD A IX',
  52: 'ADD A IY',
  53: 'ADD A [IX]',
  54: 'ADD A [IY]',
  55: 'ADD A n',
  58: 'PUSH n',
  60: 'SUB A A',
  61: 'SUB A IX',
  62: 'SUB A IY',
  63: 'SUB A [IX]',
  64: 'SUB A [IY]',
  65: 'SUB A n',
  70: 'JMP E n',
  71: 'JMP Z n',
  72: 'JMP NZ n',
  73: 'JMP C n',
  74: 'JMP NC n',
  80: 'CALL E n',
  81: 'CALL Z n',
  82: 'CALL NZ n',
  83: 'CALL C n',
  84: 'CALL NC n',
  90: 'RET E',
  91: 'RET Z',
  92: 'RET NZ',
  93: 'RET C',
  94: 'RET NC',
  99: 'HALT'
}

new Vue({
  el: "#app",
  data: {
    name: "red moon",
    pc: 0,
    sp: 99,
    a: 0,
    ix: 50,
    iy: 70,
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
    params: [],
    ms: MEMORY,
    table: NIMONIC,
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
        case 'IX':
        case 'IY':
        case 'SP':
        case 'PC':
          return this.get_register(name);

        case '[IX]':
        case '[IY]':
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
        case 'IX':
        case 'IY':
        case 'SP':
        case 'PC':
        case '[IX]':
        case '[IY]':
        case '[SP]':
          val = this.get(val);
      }
      
      switch(name){
        case 'A':
        case 'IX':
        case 'IY':
        case 'SP':
        case 'PC':
          this.set_register(name,val);
          break;

        case '[IX]':
        case '[IY]':
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

      while(this.pc < 70){
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
      for(var i = 70; i < 100; i++){
        this.set_memory(i,Math.floor(Math.random()*100));
      }
    },

    set_seqdata: function(){
      for(var i = 70; i < 100; i++){
        this.set_memory(i,99-i);
      }
    },

    import: function(){
      this.reset_memory();
      var codes = this.code.split("\n");
      var labels = {};

      this.pc = 0;
      for (var i = 0; i < codes.length; i++) {
        this.parse(codes[i])
        if(this.opecode == 'LABEL'){
          labels[this.operand] = this.pc;
        }



        for(opecode in this.table){
          if(this.table[opecode] == this.nimonic){
            this.set('[PC]', opecode);
            this.inc_pc();

            if(this.nimonic.match(/n$/)){
              this.set('[PC]', Number(this.params[2]));
              this.inc_pc();
            }
          }
        }
      }
      this.pc = 0;
    },

    parse: function(line) {
      this.nimonic = line.toUpperCase();
      this.nimonic = this.nimonic.replace(/^\d+:/,''); //行番号削除
      this.params = this.nimonic.split(' ');

      this.nimonic = this.nimonic.replace(/\d+$/,'n');
      this.nimonic = this.nimonic.replace(/:.*$/,'n');

      if(this.params[0].match(/^:/)){
        this.opecode = 'LABEL';
        this.operand = this.params[0];
        this.codesize = 0;
      }else{
        this.opecode = this.params[0];
        this.operand = this.params[2];
        if(this.nimonic.match(/n$/)){
          this.codesize = 2;
        }else{
          this.codesize = 1;
        }
      }
    },

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
      this.ix = 50;
      this.iy = 70;
      this.halt = false;
      this.zero = false;
      this.carry = false;
      this.sp = 99;
      this.message = [];
    },

    reset_memory: function(){
      for(var i = 0; i < 100; i++){
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

      switch(this.params[0]) {
        case 'NOP':
          break;

        case 'HALT':
          this.halt = true;
          break;

        case 'PUSH':
          this.push(this.params[1]);
          break;

        case 'POP':
          this.pop(this.params[1]);
          break;

        case 'INC':
          this.inc(this.params[1]);
          break;

        case 'DEC':
          this.dec(this.params[1]);
          break;

        case 'LD':
          this.set(this.params[1],this.params[2]);
          break;

        case 'ADD':
          this.a = this.add(this.a, this.get(this.params[2]));
          break;

        case 'SUB':
          this.a = this.sub(this.a, this.get(this.params[2]));
          break;

        case 'JMP':
          if(this.check_condition(this.params[1])){
            this.set('PC', this.operand);
          }
          break;
          
        case 'CALL':
          if(this.check_condition(this.params[1])){
            this.push('A');
            this.push('PC');
            this.pc = this.operand;
          }
          break;

        case 'RET':
          if(this.check_condition(this.params[1])){
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
