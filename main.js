var MEMORY = []
var PGM = "33,40,30,5,50,14,23,4,4,1,50,24,23,4,14,51,35,22,32,42,54,44,45,51,5,14,11,4,32,54,0,0,0,0,0,0"
var codes = PGM.split(',');
for(var i = 0; i < 36; i++){
  MEMORY.push({
    id: Number(i.toString(6)),
    val: Number(codes[i])
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
  34: 'LD IX Y',
  35: 'LD IY IX',
  40: 'ADD A [IX]',
  41: 'ADD A [IY]',
  42: 'SUB A [IX]',
  43: 'SUB A [IY]',
  44: 'EX A [IX]',
  45: 'EX A [IY]',
  50: 'CALL n',
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
    sp: 55,
    a: 0,
    ix: 0,
    iy: 0,
    flag: 0,
    halt: false,
    ms: MEMORY,
    message: [],
    opecode: 0,
    operands: 0,
    nimonic: '',
    table: NIMONIC
  },

  methods: {
    to10: function(a) {
      return parseInt(a,6);
    },

    to6: function(a) {
      return Number(a.toString(6));
    },

    mod36: function(a) {
      if(a < 0 || 36 <= a){
        this.flag |= 2;
      }else{
        this.flag &= 1;
      }

      a = (a + 36) % 36;
      if(a == 0){
        this.flag |= 1;
      }else{
        this.flag &= 2;
      }
      return a;
    },

    add: function(a,b){
      return this.to6(this.mod36(this.to10(a) + this.to10(b)));
    },

    sub: function(a,b){
      var x = this.to10(a) - this.to10(b);
      var y = this.mod36(x);
      return this.to6(y);
    },

    inc: function(name){
      this[name] = this.add(this[name],1);
    },

    dec: function(name){
      this[name] = this.add(this[name],-1);
    },

    inc_pc: function(){
      this.inc('pc');
    },

    get_memory: function(addr){
      return this.ms[this.to10(addr)].val;
    },

    set_memory: function(addr,val){
      this.ms[this.to10(addr)].val = val;
    },

    at_pc: function() {
      return this.get_memory(this.pc);
    },

    set: function(name,val){
      this[name].val = val;
    },

    zero: function(){
      return !!(this.flag & 1);
    },

    nonzero: function(){
      return !this.zero();
    },
    
    carry: function(){
      return !!(this.flag & 2);
    },

    noncarry: function(){
      return !this.carry();
    },

    push: function(val){
      this.set_memory(this.sp,val);
      this.dec('sp');
    },

    pop: function(name){
      this.inc('sp');
      this[name] = this.get_memory(this.sp);
    },

    fetch: function(){
      this.opecode = this.at_pc();
      this.inc_pc();
      this.nimonic = this.table[this.opecode];

      // オペランドの読み込み
      params = this.nimonic.split(' ');
      switch(params[0]){
        case 'CALL':
          this.operand = this.at_pc();
          this.inc_pc();
          break;

        case 'JMP':
        case 'LD':
        case 'ADD':
        case 'SUB':
        case 'EX':
          switch(params[2]){
            case 'n':
              this.operand = this.at_pc();
              this.inc_pc();
              break;

            case 'IX':
              this.operand = this.ix;
              break;
              
            case 'IY':
              this.operand = this.iy;
              break;

            case '[IX]':
              this.operand = this.get_memory(this.ix);
              break;
              
            case '[IY]':
              this.operand = this.get_memory(this.iy);
              break;
          }
          break;
        default:
          this.operand = null;
      }
    },

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
      this.ix = 0;
      this.iy = 0;
      this.flag = 0;
      this.halt = false;
      this.sp = 55;
      this.message = [];
    },

    reset_memory: function(){
      for(var i = 0; i < 36; i++){
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
      var msg = this.nimonic;
      if(this.operand){
        msg = msg.replace('n', this.operand);
      }
      this.add_message(msg)

      var params = this.nimonic.split(' ');
      var sub = null
      if(params.length > 1){
        sub = params[1].toLowerCase();
      }

      switch(params[0]) {
        case 'NOP':
          break;

        case 'HALT':
          this.dec('pc');
          this.halt = true;
          break;

        case 'JMP':
          switch(params[1]){
            case 'NZ':
              if(this.zero()){
                break;
              }

            case 'NC':
              if(this.carry()){
                break;
              }

            case 'AL':
              this.pc = this.operand;
              break;
          }
          break;

        case 'PUSH':
          this.push(this[sub]);
          break;

        case 'POP':
          this.inc(sub);
          break;

        case 'INC':
          this.inc(sub);
          break;

        case 'DEC':
          this.dec(sub);
          break;

        case 'LD':
          this[sub] = this.operand;
          break;

        case 'ADD':
          this.a = this.add(this.a, this.operand);
          break;

        case 'SUB':
          this.a = this.sub(this.a, this.operand);
          break;

        case 'EX':
          switch(params[2]){
            case '[IX]':
              var tmp = this.get_memory(this.ix);
              this.set_memory(this.ix, this.a);
              this.a = tmp;
              break;

            case '[IY]':
              var tmp = this.get_memory(this.iy);
              this.set_memory(this.iy, this.a);
              this.a = tmp;
              break;

          }
          break;

        case 'CALL':
          this.push(this.a);
          this.push(this.pc);
          this.pc = this.operand;
          break;

        case 'RET':
          switch(params[1]){
            case 'Z':
              if(this.nonzero()){
                break;
              }
            case 'NZ':
              if(this.zero()){
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
              this.pop('a');
              this.pop('pc');
              break;
          }
          break;

        default:
          this.add_message("無効な命令です");
      }
    }
  }
});
