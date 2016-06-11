# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160611040751) do

  create_table "cpus", force: :cascade do |t|
    t.string   "name"
    t.integer  "pc"
    t.integer  "a"
    t.integer  "sp"
    t.boolean  "led"
    t.integer  "m0"
    t.integer  "m1"
    t.integer  "m2"
    t.integer  "m3"
    t.integer  "m4"
    t.integer  "m5"
    t.integer  "m6"
    t.integer  "m7"
    t.integer  "m8"
    t.integer  "m9"
    t.integer  "m10"
    t.integer  "m11"
    t.integer  "m12"
    t.integer  "m13"
    t.integer  "m14"
    t.integer  "m15"
    t.integer  "m16"
    t.integer  "m17"
    t.integer  "m18"
    t.integer  "m19"
    t.text     "message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
