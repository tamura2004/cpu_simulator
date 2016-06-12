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
      // {id: 0, val: 1},
      // {id: 1, val: 8},
      // {id: 2, val: 12},
      // {id: 3, val: 2},
      // {id: 4, val: 0},
      // {id: 5, val: 0},
      // {id: 6, val: 0},
      // {id: 7, val: 5},
      // {id: 8, val: 19},
      // {id: 9, val: 7},
      // {id: 10, val: 0},
      // {id: 11, val: 10},
      // {id: 12, val: 0},
      // {id: 13, val: 5},
      // {id: 14, val: 19},
      // {id: 15, val: 7},
      // {id: 16, val: 12},
      // {id: 17, val: 9},
      // {id: 18, val: 0},
      // {id: 19, val: 0}
    ],
    message: [],
    wait: 0
  },
  methods: {
    // load: function(){
    //   var save = [6,3,8,5,10,5,19,7,10,9,8,5,0,0,0,0,0,0,0,0];
    //   for(var i=0; i<20; i++){
    //     this.ms[i].val = save[i];
    //   }
    // },

    turn_led: function(){
      this.led = !this.led;
    },

    inc_pc: function(){
      this.pc++;
      this.pc %= 20;
    },

    inc_sp: function(){
      this.sp++;
      this.sp %= 20;
    },

    dec_sp: function(){
      this.sp += 19;
      this.sp %= 20;
    },

    push: function(val){
      this.inc_sp();
      this.ms[this.sp].val = (val %20);
    },

    pop: function(){
      val = this.at_sp();
      this.dec_sp();
      return val;
    },

    add_a: function(val){
      this.a += (val % 20);
      this.a %= 20;
    },

    at_pc: function(){
      return this.ms[this.pc].val;
    },

    at_sp: function(){
      return this.ms[this.sp].val;
    },

    at: function(addr){
      return this.ms[addr%20].val;
    },

    reset_register: function(){
      this.pc = 0;
      this.a = 0;
      this.sp = 15;
      this.led = false;
      this.message = [];
    },

    reset_memory: function(){
      for(var i=0; i<20; i++){
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
      if(m == 0){
        this.add_message("1秒停止しました");
        this.inc_pc();

      }else if(m == 1){
        this.add_message("LEDを点灯させました");
        this.led = true;
        this.inc_pc();

      }else if(m == 2){
        this.add_message("LEDを消灯させました");
        this.led = false;
        this.inc_pc();

      }else if(m == 3){
        this.push(this.a);
        this.inc_pc();

      }else if(m == 4){
        this.a = this.pop();
        this.inc_pc();

      }else if(m == 5){
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
        this.push(this.pc + 2);
        this.push(this.a);
        this.pc = this.at(this.pc + 1);

      }else if(m == 9){
        this.a = this.pop();
        this.pc = this.pop();

      }else if(m == 10){
        this.add_message("CPUを停止しました");

      }else{
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
