new Vue({
  el: "#app",
  data: {
    name: "red moon",
    pc: 0,
    sp: 63,
    a: 0,
    b: 0,
    f: 0,
    led: false,
    ms: [
      {id: 0, val: 0},
      {id: 1, val: 0},
      {id: 2, val: 0},
      {id: 3, val: 0},
      {id: 4, val: 0},
      {id: 5, val: 0},
      {id: 6, val: 0},
      {id: 7, val: 0},
      {id: 8, val: 0},
      {id: 9, val: 0},
      {id: 10, val: 0},
      {id: 11, val: 0},
      {id: 12, val: 0},
      {id: 13, val: 0},
      {id: 14, val: 0},
      {id: 15, val: 0},
      {id: 16, val: 0},
      {id: 17, val: 0},
      {id: 18, val: 0},
      {id: 19, val: 0},
      {id: 20, val: 0},
      {id: 21, val: 0},
      {id: 22, val: 0},
      {id: 23, val: 0},
      {id: 24, val: 0},
      {id: 25, val: 0},
      {id: 26, val: 0},
      {id: 27, val: 0},
      {id: 28, val: 0},
      {id: 29, val: 0},
      {id: 30, val: 0},
      {id: 31, val: 0},
      {id: 32, val: 0},
      {id: 33, val: 0},
      {id: 34, val: 0},
      {id: 35, val: 0},
      {id: 36, val: 0},
      {id: 37, val: 0},
      {id: 38, val: 0},
      {id: 39, val: 0},
      {id: 40, val: 0},
      {id: 41, val: 0},
      {id: 42, val: 0},
      {id: 43, val: 0},
      {id: 44, val: 0},
      {id: 45, val: 0},
      {id: 46, val: 0},
      {id: 47, val: 0},
      {id: 48, val: 0},
      {id: 49, val: 0},
      {id: 50, val: 0},
      {id: 51, val: 0},
      {id: 52, val: 0},
      {id: 53, val: 0},
      {id: 54, val: 0},
      {id: 55, val: 0},
      {id: 56, val: 0},
      {id: 57, val: 0},
      {id: 58, val: 0},
      {id: 59, val: 0},
      {id: 60, val: 0},
      {id: 61, val: 0},
      {id: 62, val: 0},
      {id: 63, val: 0}
    ],
    message: [],
    wait: 0
  },
  methods: {
    turn_led: function(){
      this.led = !this.led;
    },

    inc_pc: function(){
      this.pc++;
      this.pc %= 64;
    },

    inc_sp: function(){
      this.sp++;
      this.sp %= 64;
    },

    dec_sp: function(){
      this.sp += 63;
      this.sp %= 64;
    },

    push: function(val){
      this.ms[this.sp].val = (val % 64);
      this.dec_sp();
    },

    pop: function(){
      this.inc_sp();
      val = this.at_sp();
      return val;
    },

    add_a: function(val){
      this.a += val;
      if(this.a < 64){
        this.f = 0;
      }else{
        this.a %= 64;
        this.f = 2;
      }
    },

    sub_a: function(val){
      this.a -= val;
      if(this.a == 0){
        this.f = 1;
      }else if (this.a < 0){
        this.a += 64;
        this.f = 2;
      }else{
        this.f = 0;
      }
    },

    add_b: function(val){
      this.b += val;
      if(this.b < 64){
        this.f = 0;
      }else{
        this.b %= 64;
        this.f = 2;
      }
    },

    sub_b: function(val){
      this.b -= val;
      if(this.b == 0){
        this.f = 1;
      }else if (this.b < 0){
        this.b += 64;
        this.f = 2;
      }else{
        this.f = 0;
      }
    },

    at_pc: function(){
      return this.ms[this.pc].val;
    },

    at_sp: function(){
      return this.ms[this.sp].val;
    },

    at: function(addr){
      return this.ms[addr % 64].val;
    },

    set: function(addr,val){
      this.ms[addr % 64].val = (val % 64);
    },

    add: function(a,b){
      var val = a + b;
      if(val > 64){
        val %= 64;
        this.f |= 2;
      }
      return val;
    },

    sub: function(a,b){
      var val = a - b;
      if(val == 0){
        this.f |= 1;
      }else if(val < 0){
        this.f |= 2;
        val %= 64; 
      }
      return val;
    },

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
      this.b = 0;
      this.f = 0;
      this.sp = 63;
      this.led = false;
      this.message = [];
    },

    reset_memory: function(){
      for(var i=0; i<64; i++){
        this.ms[i].val = 0;
      }
    },

    add_message: function(msg){
      if(msg=="1秒停止しました"){
        if(this.wait > 0){
          this.message.pop();
        }
        this.wait++;
        msg = this.wait + "秒停止しました";
      }else{
        this.wait = 0;
      }

      this.message.push(msg);
      var t = $("textarea#cpu_message");
      t.animate({
        scrollTop: t[0].scrollHeight - t.height()
      }, 100);
    },

    execute_all: function(){
      var step = 0;
      var loop = function(){
        this.execute();
        step++;
        if(step > 1000){
          this.add_message("1000ステップ実行で中断しました。");

        }else if(this.at_pc() > 63){
          this.add_message("無効な命令です");

        }else if(this.at_pc() == 1){
          this.add_message("CPUを停止しました");

        }else{
          setTimeout(loop,300);
        }
      }.bind(this);
      loop();
    },

    execute: function(event){

      var m = this.at_pc();

      switch(m) {
        case 0: // NOP
          this.inc_pc();
          this.add_message("NOP");
          break;

        case 1: // HALT
          this.add_message("HALT");
          break;

        case 2: // RST
          this.pc = 8;
          this.add_message("RST");
          break;

        case 3: // INT
          this.push(this.a);
          this.push(this.b);
          this.push(this.f);
          this.inc_pc();
          this.push(this.pc);
          this.pc = 0;
          this.add_message("INT");
          break;

        case 4: // CALL n
          this.push(this.a);
          this.push(this.b);
          this.push(this.f);
          this.inc_pc();
          this.pc = this.at_pc();
          this.inc_pc();
          this.push(this.pc);
          this.add_message("CALL " + this.pc);
          break;

        case 5: // RET
          this.pc = this.pop()
          this.f = this.pop()
          this.b = this.pop()
          this.a = this.pop()
          this.add_message("RET");
          break;

        case 6: // RND A
          this.a = Math.floor(Math.random()*64);
          this.inc_pc();
          this.add_message("RND A")
          break;

        case 7: // PRT A
          this.inc_pc();
          this.add_message(String.fromCharCode(this.a + 32));
          break;

        case 8: // INC A
          this.add_a(1);
          this.inc_pc();
          this.add_message("INC A");
          break;

        case 9: // INC B
          this.add_b(1);
          this.inc_pc();
          this.add_message("INC B");
          break;

        case 10: // DEC A
          this.sub_a(1);
          this.inc_pc();
          this.add_message("DEC A");
          break;

        case 11: // DEC B
          this.sub_b(1);
          this.inc_pc();
          this.add_message("DEC B");
          break;

        case 12: // PUSH A
          this.push(this.a);
          this.inc_pc();
          this.add_message("PUSH A");
          break;

        case 13: // PUSH B
          this.push(this.b);
          this.inc_pc();
          this.add_message("PUSH B");
          break;

        case 14: // POP A
          this.a = this.pop();
          this.inc_pc();
          this.add_message("POP A");
          break;

        case 15: // POP B
          this.b = this.pop();
          this.inc_pc();
          this.add_message("POP B");
          break;

        case 16: // LD A n
          this.inc_pc();
          this.a = this.at_pc();
          this.inc_pc();
          this.add_message("LD A " + this.a);
          break;

        case 17: // LD A B
          this.a = this.b;
          this.inc_pc();
          this.add_message("LD A B");
          break;

        case 18: // LD A SP
          this.a = this.sp;
          this.inc_pc();
          this.add_message("LD A SP");
          break;

        case 19: // LD A [n]
          this.inc_pc();
          var n = this.at_pc();
          this.a = this.at(n);
          this.inc_pc();
          this.add_message("LD A [" + n + "]");
          break;

        case 20: // LD A [B]
          this.a = this.at(this.b);
          this.inc_pc();
          this.add_message("LD A [B]");
          break;

        case 21: // LD A [SP]
          this.a = this.at(this.sp);
          this.inc_pc();
          this.add_message("LD A [SP]");
          break;

        case 22: // LD A [B+n]
          this.inc_pc();
          var n = this.at_pc();
          this.a = this.at(this.b + n);
          this.inc_pc();
          this.add_message("LD A [B+" + n + "]");
          break;

        case 23: // LD A [PC+n]
          this.inc_pc();
          var n = this.at_pc();
          this.a = this.at(this.sp + n);
          this.inc_pc();
          this.add_message("LD A [SP+" + n + "]");
          break;

        case 24: // LD B n
          this.inc_pc();
          var n = this.at_pc();
          this.b = n;
          this.inc_pc();
          this.add_message("LD B " + n);
          break;

        case 25: // LD B A
          this.b = this.a;
          this.inc_pc();
          this.add_message("LD B A");
          break;

        case 26: // LD A SP
          this.sp = this.a;
          this.inc_pc();
          this.add_message("LD SP A");
          break;

        case 27: // LD [n] A
          this.inc_pc();
          var n = this.at_pc();
          this.set(n, this.a);
          this.inc_pc();
          this.add_message("LD [" + n + "] A");
          break;

        case 28: // LD [B] A
          this.set(this.b, this.a);
          this.inc_pc();
          this.add_message("LD [B] A");
          break;

        case 29: // LD [SP] A
          this.set(this.sp, this.a);
          this.inc_pc();
          this.add_message("LD [SP] A");
          break;

        case 30: // LD [B+n] A
          this.inc_pc();
          var n = this.at_pc();
          this.set(this.b + n, this.a);
          this.inc_pc();
          this.add_message("LD [B+" + n + "] A");
          break;

        case 31: // LD [SP+n] A
          this.inc_pc();
          var n = this.at_pc();
          this.set(this.sp + n, this.a);
          this.inc_pc();
          this.add_message("LD [SP+" + n + "] A");
          break;

        case 32: // AND A B
          this.a &= this.b;
          this.inc_pc();
          this.add_message("AND A B");
          break;

        case 33: // OR A B
          this.a |= this.b;
          this.inc_pc();
          this.add_message("OR A B");
          break;

        case 34: // XOR A B
          this.a ^= this.b;
          this.inc_pc();
          this.add_message("OR A B");
          break;

        case 35: // NOT A
          this.a = 63 - this.a;
          this.inc_pc();
          this.add_message("NOT A");
          break;

        case 36: // NOT F
          this.f = 63 - this.f;
          this.inc_pc();
          this.add_message("NOT F");
          break;

        case 37: // NEG A
          this.a = (64 - this.a) % 64;
          this.inc_pc();
          this.add_message("NEG A");
          break;

        case 38: // DIV A B
          this.a = Math.floor(this.a / this.b);
          this.inc_pc();
          this.add_message("DIV A B");
          break;

        case 39: // MOD A B
          this.a = this.a % this.b;
          this.inc_pc();
          this.add_message("MOD A B");
          break;

        case 40: // ADD A n
          this.inc_pc();
          var n = this.at_pc();
          this.add_a(n);
          this.inc_pc();
          this.add_message("ADD A " + n);
          break;

        case 41: // ADD A B
          this.add_a(this.b);
          this.inc_pc();
          this.add_message("ADD A B");
          break;

        case 42: // ADD A SP
          this.add_a(this.sp);
          this.inc_pc();
          this.add_message("ADD A SP");
          break;

        case 43: // ADD A [n]
          this.inc_pc();
          var n = this.at_pc();
          this.add_a(this.at(n));
          this.inc_pc();
          this.add_message("ADD A [" + n + "]");
          break;

        case 44: // ADD A [B]
          this.add_a(this.at(this.b));
          this.inc_pc();
          this.add_message("ADD A [B]");
          break;

        case 45: // ADD A [SP]
          this.add_a(this.at(this.sp));
          this.inc_pc();
          this.add_message("ADD A [SP]");
          break;

        case 46: // ADD A [B+n]
          this.inc_pc();
          var n = this.at_pc();
          this.add_a(this.at(this.b + n));
          this.inc_pc();
          this.add_message("ADD A [B+" + n + "]");
          break;

        case 47: // ADD A [PC+n]
          this.inc_pc();
          var n = this.at_pc();
          this.add_a(this.at(this.sp + n));
          this.inc_pc();
          this.add_message("ADD A [SP+" + n + "]");
          break;

        case 48: // SUB A n
          this.inc_pc();
          var n = this.at_pc();
          this.sub_a(n);
          this.inc_pc();
          this.add_message("SUB A " + n);
          break;

        case 49: // SUB A B
          this.sub_a(this.b);
          this.inc_pc();
          this.add_message("SUB A B");
          break;

        case 50: // SUB A SP
          this.sub_a(this.sp);
          this.inc_pc();
          this.add_message("SUB A SP");
          break;

        case 51: // SUB A [n]
          this.inc_pc();
          var n = this.at_pc();
          this.sub_a(this.at(n));
          this.inc_pc();
          this.add_message("SUB A [" + n + "]");
          break;

        case 52: // SUB A [B]
          this.sub_a(this.at(this.b));
          this.inc_pc();
          this.add_message("SUB A [B]");
          break;

        case 53: // SUB A [SP]
          this.sub_a(this.at(this.sp));
          this.inc_pc();
          this.add_message("SUB A [SP]");
          break;

        case 54: // SUB A [B+n]
          this.inc_pc();
          var n = this.at_pc();
          this.sub_a(this.at(this.b + n));
          this.inc_pc();
          this.add_message("SUB A [B+" + n + "]");
          break;

        case 55: // SUB A [PC+n]
          this.inc_pc();
          var n = this.at_pc();
          this.sub_a(this.at(this.sp + n));
          this.inc_pc();
          this.add_message("SUB A [SP+" + n + "]");
          break;

        case 56:
          this.inc_pc();
          var n = this.at_pc();
          this.pc = n;
          this.add_message("JMP " + n);
          break;

        case 57:
          this.pc = this.b;
          this.add_message("JMP B");
          break;

        case 58:
          this.inc_pc();
          var n = this.at_pc();
          if(this.f & 1){
            this.pc = n;
          }else{
            this.inc_pc();
          }
          this.add_message("JPZ " + n);
          break;

        default:
          this.add_message("無効な命令です");
      }
    }
  },
  computed: {
    led_name: function(){
      return this.led ?  '点灯' : '消灯';
    }
  }
});
