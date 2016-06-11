json.array!(@cpus) do |cpu|
  json.extract! cpu, :id, :pc, :a, :sp, :led, :m1, :m2, :m3, :m4, :m5, :m6, :m7, :m8, :m9, :m10, :m11, :m12, :m13, :m14, :m15, :m16, :m17, :m18, :m19, :m20
  json.url cpu_url(cpu, format: :json)
end
