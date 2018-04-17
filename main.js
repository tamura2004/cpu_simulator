new Vue({
  el: "#app",
  data: {
    name: "red moon",
    pc: 0,
    sp: 63,
    a: 0,
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
      this.a += (val % 64);
      this.a %= 64;
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

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
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

        }else if(this.at_pc() > 10){
          this.add_message("無効な命令です");

        }else if(this.at_pc() == 10){
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
        case 0:
          this.add_message("NOP");
          this.inc_pc();
          break;

        case 1:
          this.add_message("LEDを点灯させました");
          this.led = true;
          this.inc_pc();
          break;

        case 2:
          this.add_message("LEDを消灯させました");
          this.led = false;
          this.inc_pc();
          break;

        case 3:
          this.add_message("PUSH A");
          this.push(this.a);
          this.inc_pc();
          break;

        case 4:
          this.add_message("POP A");
          this.a = this.pop();
          this.inc_pc();

        case 5:
          this.add_message("ADD A,n");
          this.inc_pc();
          this.add_a(this.at_pc());
          this.inc_pc();
          break;

        case 6:
          this.add_message("LD A,n");
          this.inc_pc();
          this.a = this.at_pc();
          this.inc_pc();
          break;

        case 7:
          this.add_message("JNZ n");
          this.inc_pc();
          if(this.a == 0){
            this.inc_pc();
          }else{
            this.pc = this.at_pc();
          }
          break;

        case 8:
          this.add_message("CALL n");
          this.push(this.pc + 2);
          this.push(this.a);
          this.pc = this.at(this.pc + 1);
          break;

        case 9:
          this.add_message("RET");
          this.a = this.pop();
          this.pc = this.pop();
          break;

        case 10:
          this.add_message("HALT");
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
