class Cpu < ActiveRecord::Base
  after_initialize :set_default_value

  def memory
    [m0,m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15,m16,m17,m18,m19]
  end

  def memory=(ms)
    ms.each_with_index do |m,i|
      self["m#{i}"] = m
    end
  end

  def execute_all
    execute_step = 0
    until self["m#{pc}"] == 10
      execute
      if (execute_step += 1) > 100
        write_message "100ステップ実行で中断しました。無限ループではありませんか。"
        save!
        break
      end
    end
  end

  def execute
    case self["m#{pc}"]
    when 0
      # write_message "NOP"
      write_message "１秒停止しました"
      inc_pc
    when 1
      # write_message "ON"
      write_message "LEDを点灯させました"
      self.led = true
      inc_pc
    when 2
      # write_message "OFF"
      write_message "LEDを消灯させました"
      self.led = false
      inc_pc
    when 3
      # write_message "PUSH"
      push a
      inc_pc
    when 4
      # write_message "POP"
      self.a = pop
      inc_pc
    when 5
      # write_message "ADD"
      inc_pc
      add_a self["m#{pc}"]
      inc_pc
    when 6
      # write_message "LD"
      inc_pc
      self.a = self["m#{pc}"]
      inc_pc
    when 7
      # write_message "JPNZ"
      inc_pc
      if a != 0
        self.pc = self["m#{pc}"]
      else
        inc_pc
      end
    when 8
      # write_message "CALL"
      push ((pc+2)%20)
      push a
      self.pc = self["m#{pc+1}"]
    when 9
      # write_message "RET"
      self.a = pop
      self.pc = pop
    when 10
      write_message "CPUを停止しました"
    else
      write_message "無効な命令です:#{memory[sp]}"
    end
    save!
  end

  def write_message(msg)
    self.message += (msg + "\n")
  end

  def push(val)
    inc_sp
    self["m#{sp}"] = val
  end

  def pop
    val = self["m#{sp}"]
    dec_sp
    return val
  end

  def inc_pc
    self.pc += 1
    self.pc %= 20
  end

  def inc_sp
    self.sp += 1
    self.sp %= 20
  end

  def dec_sp
    self.sp -= 1
    self.sp %= 20
  end

  def add_a(value)
    self.a += value
    self.a %= 20
  end

  private

    def set_default_value
      self.name ||= random_phrase
      20.times do |i|
        self["m#{i}"] ||= 0
      end
      self.a ||= 0
      self.pc ||= 0
      self.sp ||= 15
    end

    def random_phrase
      [Forgery::Basic.color, Forgery::Address.street_name].join(" ").downcase
    end

end
