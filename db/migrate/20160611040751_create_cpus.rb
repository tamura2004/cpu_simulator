class CreateCpus < ActiveRecord::Migration
  def change
    create_table :cpus do |t|
      t.string :name
      t.integer :pc
      t.integer :a
      t.integer :sp
      t.boolean :led
      t.integer :m0
      t.integer :m1
      t.integer :m2
      t.integer :m3
      t.integer :m4
      t.integer :m5
      t.integer :m6
      t.integer :m7
      t.integer :m8
      t.integer :m9
      t.integer :m10
      t.integer :m11
      t.integer :m12
      t.integer :m13
      t.integer :m14
      t.integer :m15
      t.integer :m16
      t.integer :m17
      t.integer :m18
      t.integer :m19
      t.text :message

      t.timestamps null: false
    end
  end
end
