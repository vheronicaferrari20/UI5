'use strict';

module.exports = function(grunt) {

	grunt.initConfig({

		dir: {
			webapp: 'WebContent',
			dist: 'dist'
		},

		openui5_preload: {
			component: {
				options: {
					resources: {
						cwd: '<%= dir.dist %>',
						src: [ // include/exclude patterns for files  
	                        '**/*.js', // in this example, we do only have js/xml files  
	                        '**/*.xml', // but this can be used to e.g. exclude language-specific files
	                        '!resources/**',
	                        '!dhtmlxGantt_v4.0.0/**',
	                        '!orgdiagram/**',
	                        '!jquery-cookie/**',
	                        '!img/**'


	                    ],  
						prefix: 'App'
					},
					dest: '<%= dir.dist %>'
				},
				components: true
			}
		},

		clean: {
			dist: '<%= dir.dist %>/'
		},

		copy: {
			dist: {
				files: [ {
					expand: true,
					cwd: '<%= dir.webapp %>',
					src: [
						'**',
						'!test/**'
					],
					dest: '<%= dir.dist %>'
				} ]
			}
		},

		eslint: {
			webapp: ['<%= dir.webapp %>']
		},

		removelogging: {
			dist: {
			  src: [
			  	"<%= dir.dist %>/control/**/*.js",
			  	"<%= dir.dist %>/controller/**/*.js",
			  	"<%= dir.dist %>/model/**/*.js",
			  	"<%= dir.dist %>/data/**/*.js",
			  	"<%= dir.dist %>/view/**/*.js",


			  	"<%= dir.dist %>/*.js"] // Each file will be overwritten with the output! 
			}
		},

		connect: {
		  server: {
		    options: {
		      livereload: 35729,	
		      port: 7000
		    }
		  }
		},

		openui5_connect: {
		  server: {
		    options: {
		      appresources: '<%= dir.webapp %>'
		    }
		  }
		},

		watch: {
            webapp: {
                files: "<%= dir.webapp %>/**",
                tasks: ["eslint"]
            },
            livereload: {
                options: {
                    livereload: "35729"
                },
                files: [
                    "<%= dir.webapp %>/**"
                ]
            }
        }



	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-openui5');
	grunt.loadNpmTasks("grunt-remove-logging");
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Server task
	grunt.registerTask('serve', function(target) {
		grunt.task.run('openui5_connect:server:keepalive');
	});

	// Linting task
	grunt.registerTask('lint', ['eslint']);

	// Build task
	grunt.registerTask('build', ['clean','copy','removelogging','openui5_preload']);

	// Default task
	//grunt.registerTask('default', [
	//	'lint',
	//	'clean',
	//	'build',
	//	'serve:dist'
	//]);
};