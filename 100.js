var MEMORY = []
// var PGM = "35,50,12,21,23,4,0,1,22,50,22,23,4,12,31,42,54,31,44,45,51,0,0,0,10,1,5,2,4,3,0,0,0,0,0,0"
// var codes = PGM.split(',');
for(var i = 0; i < 100; i++){
  MEMORY.push({
    id: i,
    val: 0
  });
}

var NIMONIC = {
  0: 'NOP',
  1: 'HALT',
  2: 'RAND',
  3: 'JMP AL n',
  4: 'JMP NZ n',
  5: 'JMP NC n',
  10: 'PUSH A',
  11: 'PUSH IX',
  12: 'PUSH IY',
  13: 'POP A',
  14: 'POP IX',
  15: 'POP IY',
  20: 'INC A',
  21: 'INC IX',
  22: 'INC IY',
  23: 'DEC A',
  24: 'DEC IX',
  25: 'DEC IY',
  30: 'LD A n',
  31: 'LD A [IX]',
  32: 'LD A [IY]',
  33: 'LD IX n',
  34: 'LD IX IY',
  35: 'LD IY IX',
  40: 'ADD A [IX]',
  41: 'ADD A [IY]',
  42: 'SUB A [IX]',
  43: 'SUB A [IY]',
  44: 'LD [IX] [IY]',
  45: 'LD [IY] A',
  50: 'CALL AL n',
  51: 'RET AL',
  52: 'RET Z',
  53: 'RET NZ',
  54: 'RET C',
  55: 'RET NC'
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
    code: [],
    msg: '',
    opecode: 0,
    operand: 0,
    reg: '',
    addr: 0,
    val: 0,
    nimonic: '',
    params: [],
    ms: MEMORY,
    table: NIMONIC
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

    zero: function(){
      return this.flag == 1;
    },

    nonzero: function(){
      return this.flag != 1;
    },
    
    carry: function(){
      return this.flag == 2;
    },

    noncarry: function(){
      return this.flag != 2;
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

      this.nimonic = this.table[this.opecode];
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
      this.code = [];

      while(this.pc < 90){
        var pc = this.pc;
        this.fetch();
        if(this.msg != 'NOP'){
          this.code.push(String(pc) + ":" + this.msg);
        }
      }
      if(this.code.length == 0){
        this.code.push("エクスポートするコードがありません");
      }
      this.pc = 0;
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

        case 'JMP':
          switch(this.params[1]){
            case 'NZ':
              if(this.flag == 1){
                break;
              }

            case 'NC':
              if(this.carry()){
                break;
              }

            case 'AL':
              this.set('PC', this.params[2])
              break;
          }
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
          this.a = this.add(this.a, this.val);
          break;

        case 'SUB':
          this.a = this.sub(this.a, this.val);
          break;

        case 'CALL':
          this.push('A');
          this.push('PC');
          this.pc = this.operand;
          break;

        case 'RET':
          switch(this.params[1]){
            case 'Z':
              if(this.nonzero()){
                break;
              }
            case 'NZ':

              if(this.flag == 1){
                break;
              }
            case 'C':
              if(this.noncarry()){
                break;
              }
            case 'NC':
              if(this.carry()){
                break;
              }
            case 'AL':
              this.pop('PC');
              this.pop('A');
              break;
          }
          break;

        default:
          this.add_message("無効な命令です");
      }
    }
  }
});