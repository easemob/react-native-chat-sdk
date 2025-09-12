
# powershell script

$type = $args[1]
$source
if ( "rn" -eq $type ) {
    $source = "CMakeLists.txt.rn"
}
elseif ( "flutter" -eq $type ) {
    $source = "CMakeLists.txt.flutter"
}
else {
    Write-Error "This type is not support."
}
Copy-Item $source -Destination "CMakeLists.txt"