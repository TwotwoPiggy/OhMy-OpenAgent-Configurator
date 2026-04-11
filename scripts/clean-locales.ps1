$localesPath = ".\release\win-unpacked\locales"

if (Test-Path $localesPath) {
    $keepLocales = @("en-US.pak", "zh-CN.pak")
    
    Get-ChildItem -Path $localesPath -Filter "*.pak" | ForEach-Object {
        if ($keepLocales -notcontains $_.Name) {
            Remove-Item $_.FullName -Force
            Write-Host "已删除语言文件: $($_.Name)"
        }
    }
    
    Write-Host "`n语言文件清理完成！保留的语言: $($keepLocales -join ', ')"
} else {
    Write-Host "错误: 找不到 locales 目录"
    exit 1
}
