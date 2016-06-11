class CpusController < ApplicationController
  before_action :set_cpu, only: [:show, :edit, :update, :destroy]

  # GET /cpus
  # GET /cpus.json
  def index
    @cpus = Cpu.all
  end

  # GET /cpus/1
  # GET /cpus/1.json
  def show
  end

  # GET /cpus/new
  def new
    @cpu = Cpu.create
    redirect_to edit_cpu_path(@cpu), notice: "セーブ名#{@cpu.name}を登録しました"
  end

  # GET /cpus/1/edit
  def edit
  end

  # POST /cpus
  # POST /cpus.json
  def create
    # @cpu = Cpu.new(cpu_params)

    # respond_to do |format|
    #   if @cpu.save
    #     format.html {
    #       redirect_to cpus_path, notice: "セーブ名#{@cpu.name}を登録しました"
    #     }
    #     format.json { render :show, status: :created, location: @cpu }
    #   else
    #     format.html { render :new }
    #     format.json { render json: @cpu.errors, status: :unprocessable_entity }
    #   end
    # end
  end

  # PATCH/PUT /cpus/1
  # PATCH/PUT /cpus/1.json
  def update
    respond_to do |format|
      if @cpu.update(cpu_params)

        if params[:commit] == "１サイクル実行"
          @cpu.reload.execute
        else
          @cpu.reload.execute_all
        end

        format.html {
          redirect_to edit_cpu_path(@cpu)
        }
        format.json { render :show, status: :ok, location: @cpu }
      else
        format.html { render :edit }
        format.json { render json: @cpu.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /cpus/1
  # DELETE /cpus/1.json
  def destroy
    @cpu.destroy
    respond_to do |format|
      format.html { redirect_to cpus_url, notice: "#{@cpu.name}は削除されました" }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_cpu
      @cpu = Cpu.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def cpu_params
      params.require(:cpu).permit(:name, :pc, :a, :sp, :led, :m0, :m1, :m2, :m3, :m4, :m5, :m6, :m7, :m8, :m9, :m10, :m11, :m12, :m13, :m14, :m15, :m16, :m17, :m18, :m19, :message)
    end
end
