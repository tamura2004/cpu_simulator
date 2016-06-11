new Vue({
  el: "#app",
  data: {
    name: "red moon",
    pc: 0,
    sp: 15,
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
      {id: 19, val: 0}
    ],
    message: ""
  },
  methods: {
    turnLed: function(){
      this.led = !this.led;
    },

    inc_pc: function(){
      this.pc++;
      this.pc = this.pc % 20;
    },

    inc_sp: function(){
      this.sp++;
      this.sp = this.sp % 20;
    },

    dec_sp: function(){
      this.sp--;
      this.sp = this.sp % 20;
    },

    push: function(val){
      this.inc_sp();
      this.ms[this.sp].val = val;
    },

    pop: function(){
      val = this.at_sp();
      this.inc_sp();
      return val;
    },

    add_a: function(val){
      this.a += val;
      this.a %= 20;
    },

    at_pc: function(){
      return this.ms[this.pc].val;
    },

    at_sp: function(){
      return this.ms[this.sp].val;
    },

    reset: function(){
      this.pc = 0;
      this.a = 0;
      this.sp = 15;
      this.led = false;
      this.message = "";
      for(var i=0; i<20; i++){
        this.ms[i].val = 0;
      }
    },

    execute_all: function(){
      var step = 0;
      while(this.at_pc() != 10){
        this.execute();
        step++;
        if(step > 100){
          this.message += "100ステップ実行で中断しました。無限ループではありませんか。\n";
          return;
        }
      }
    },

    execute: function(event){

      var m = this.at_pc();
      if(m == 0){
        this.message += "１秒停止しました\n";
        this.inc_pc();

      }else if(m == 1){
        this.message += "LEDを点灯させました\n";
        this.led = true;
        this.inc_pc();

      }else if(m == 2){
        this.message += "LEDを消灯させました\n";
        this.led = false;
        this.inc_pc();

      }else if(m == 3){
        this.push(this.a);
        this.inc_pc();

      }else if(m == 4){
        this.a = this.pop();
        this.inc_pc();

      }else if(m == 5){
        this.message += m + "\n";
        this.inc_pc();
        this.add_a(this.at_pc());
        this.inc_pc();

      }else if(m == 6){
        this.inc_pc();
        this.a = this.at_pc();
        this.inc_pc();

      }else if(m == 7){
        this.inc_pc();
        if(this.a == 0){
          this.inc_pc();
        }else{
          this.pc = this.at_pc();
        }

      }else if(m == 8){
        this.inc_pc();
        this.push((1+this.pc)%20);
        this.push(this.a);
        this.pc = this.at_pc();

      }else if(m == 9){
        this.a = this.pop();
        this.pc = this.pop();

      }else if(m == 10){
        this.message += "CPUを停止しました\n";

      }else{
        this.message += "無効な命令です\n";

      }
    }
  },
  computed: {
    led_name: function(){
      return this.led ?  '点灯' : '消灯';
    }
  }
});
