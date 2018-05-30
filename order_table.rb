table = []

DATA.each_with_index do |line,i|
	cmds = line.chomp.split(/,/)
	cmds.shift
	cmds.each_with_index do |cmd,j|
		table << sprintf("\t%2d: '%s',", i+j*10, cmd)
	end
end

puts table.sort.map{|e|e.gsub(/^[\s\d]+:/,"")}


__END__
0,LD A B,LD C A,LD [C] A,RET E n,CMP A B,ADD A B,SUB A B,POP A,INC A,EX A B
1,LD A C,LD C B,LD [C] B,RET Z n,CMP A C,ADD A C,SUB A C,POP B,INC B,EX B C
2,LD A [B],LD C [B],LD [C] C,RET NZ n,CMP A [B],ADD A [B],SUB A [B],POP C,INC C,EX A C
3,LD A [C],LD C [C],LD [C] [B],RET C n,CMP A [C],ADD A [C],SUB A [C],PUSH A,DEC A,EX A [B]
4,LD A n,LD C n,LD [C] n,RET NC n,CMP A n,ADD A n,SUB A n,PUSH B,DEC B,EX A [C]
5,LD B A,LD [B] A,JMP E n,CALL E n,CMP B A,ADD B A,SUB B A,PUSH C,DEC C,EX B [B]
6,LD B C,LD [B] B,JMP Z n,CALL Z n,CMP B C,ADD B C,SUB B C,AND A B,OR A B,EX B [C]
7,LD B [B],LD [B] C,JMP NZ n,CALL NZ n,CMP B [B],ADD B [B],SUB B [B],AND A C,OR A C,EX C [B]
8,LD B [C],LD [B] [C],JMP C n,CALL C n,CMP B [C],ADD B [C],SUB B [C],AND A [B],OR A [B],EX C [C]
9,LD B n,LD [B] n,JMP NC n,CALL NC n,CMP B n,ADD B n,SUB B n,AND A [C],OR A [C],HALT
