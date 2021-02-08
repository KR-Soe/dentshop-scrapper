#!/bin/bash
scrappers=(biotech clandent dentallaval expressdent exprodental mayordent)

execute_scrapper() {
    echo "loading virtualenvironment for python"
    source ~/.envs/dentshop/bin/activate
    directory_name=$(dirname $BASH_SOURCE)
    cd $directory_name
    python -m scrappers.$1.py
}

for i in "${scrappers[@]}"
do
    if [ "$i" == $1 ] ; then
        execute_scrapper $1
        exit 0
    fi
done

echo "there is no $1 on your processor list"
exit -1
