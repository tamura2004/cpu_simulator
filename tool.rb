commands = []

regs = %w(A IX IY [IX] [IY])
vals = %w(A IX IY [IX] [IY] n)

regs.each_with_index do |to, h|
  vals.each_with_index do |from, l|
    next if from == to
    next if to == 'n'
    commands.push sprintf("%2d: 'LD %s %s'",h*10+l,to,from)
  end
end

opes = %w(INC DEC PUSH POP)
regs = %w(A IX IY [IX] [IY] n)
opes.each_with_index do |ope, i|
  regs.each_with_index do |reg, j|
    next if reg == 'n' && ope != 'PUSH'
    commands.push sprintf("%2d: '%s %s'",j*10+i+6,ope,reg)
  end
end

opes = %w(ADD SUB)
regs = %w(A IX IY [IX] [IY] n)
opes.each_with_index do |ope, i|
  regs.each_with_index do |reg, j|
    commands.push sprintf("%2d: '%s A %s'",(i+5)*10+j,ope,reg)
  end
end

opes = %w(JMP CALL RET)
conds = %w(E Z NZ C NC)
opes.each_with_index do |ope, i|
  conds.each_with_index do |cond,j|
    num = (i+7)*10+j
    if ope == "RET"
      commands.push sprintf("%2d: '%s %s'",num,ope,cond)
    else
      commands.push sprintf("%2d: '%s %s n'",num,ope,cond)
    end
  end
end

commands.push " 0: 'NOP'"
commands.push "99: 'HALT'"

puts commands.sort.join(",\n")
