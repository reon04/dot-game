FROM httpd:2.4
COPY LICENSE README.md startup.sh .
COPY ./htdocs/ /usr/local/apache2/htdocs/
CMD ["/usr/local/apache2/startup.sh"]