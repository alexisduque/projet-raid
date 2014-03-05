#!/bin/sh

find . -type f -name "*.xml" -exec grep -il '1711091050407331029' {} \; > liste_fichiers.txt
find . -type f -name "*.js" -exec grep -il '1711091050407331029' {} \; >> liste_fichiers.txt
find . -type f -name "*.html" -exec grep -il '1711091050407331029' {} \; >> liste_fichiers.txt

for filename in `cat liste_fichiers.txt`
do
        sed -i -e "s/1711091050407331029/nhf8wztv3m9wglcda6n6cbuf/g" $filename
        echo $filename replaced
done

