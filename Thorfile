require 'json/pure'

class Build < Thor  
  # This is the list of files to concatenate. The first file will appear at the top of the final file. All files are relative to the lib directory.
  FILES = [
    "src/class.js", "src/gamecore.js", "src/device.js", "src/jhashtable.js", "src/hashlist.js", 
    "src/linkedlist.js", "src/queue.js", "src/pooled.js", "src/perf.js", "src/stacktrace.js"   
  ]
  
  desc "dev", "Concatenate all the js files into /dist/gamecore-VERSION.js."
  method_option :date, :aliases => "-d", :required => false, :type => :string, :desc => "The release date"
  def dev(version)
    file_name = "dist/gamecore-#{version}.js"
    
    puts ":: Deleting other development files..."
    Dir.foreach("dist") do |file|
      puts ":: Building the file /#{file}..."
      if file.match(/.*[^(min)]\.js/)
        File.delete("dist/" + file)
      end
    end
    
    puts ":: Building the file /#{file_name}..."
    File.open(file_name, "w") do |file|
      file.puts concatenate(version, options[:date])
    end
    
    puts "   -> Done!"
  end
  
  desc "prod", "Concatenate all the js files in into /dist/gamecore-VERSION.min.js and minify it."
  method_option :date, :aliases => "-d", :required => false, :type => :string, :desc => "The release date"
  def prod(version)
    file_name = "dist/gamecore-#{version}.min.js"
    
    puts ":: Deleting other development files..."
    Dir.foreach("dist") do |file|
      if file.match(/.*min\.js/)
        File.delete("dist/" + file)
      end
    end
    
    puts ":: Building the file /#{file_name}..."
    require 'json/pure'
    require 'uglifier'
    File.open(file_name, "w") do |file|
      uglify = Uglifier.compile(concatenate(version, options[:date]))
      uglify.sub!(/\*\/ .+ \*\//xm, "*/")
      file.puts uglify
    end
    puts ":: Minifying the file /#{file_name}..."
    puts "   -> Done!"
  end
  
  private
  
    def concatenate(version, date)
      date ||= Time.now.strftime("%b %d %Y")
      content = ""
      FILES.each do |file|
        content << IO.read(File.expand_path(file)) << "\n"
      end
      
      # Add the version number
      content.sub!("@version", version)
      
      # Add the date
      content.sub!("@date", date)
      
      return content
    end

end
  
