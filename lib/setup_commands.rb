# rails g scaffold cpu pc:integer a:integer sp:integer led:boolean m1:integer m2:integer m3:integer m4:integer m5:integer m6:integer m7:integer m8:integer m9:integer m10:integer m11:integer m12:integer m13:integer m14:integer m15:integer m16:integer m17:integer m18:integer m19:integer m20:integer

(0..19).each do |i|
  print "m#{i},"
end
