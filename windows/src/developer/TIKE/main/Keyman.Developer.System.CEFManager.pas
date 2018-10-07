unit Keyman.Developer.System.CEFManager;

interface

uses
  System.Classes,
  System.Generics.Collections,
  uCEFApplication;

//
// We wrap the TCefApplication so we can configure it
// outside the .dpr source and keep the .dpr source
// cleaner
//
type
  IKeymanCEFHost = interface;

  TShutdownCompletionHandlerEvent = procedure(Sender: IKeymanCEFHost) of object;

  IKeymanCEFHost = interface
    ['{DFABC8BF-803E-45E6-B7DC-522C7FEB08EB}']
    procedure StartShutdown(CompletionHandler: TShutdownCompletionHandlerEvent);
  end;

  TCEFManager = class
  private
    FWindows: TList<IKeymanCEFHost>;
    FShutdownCompletionHandler: TNotifyEvent;
    procedure CompletionHandler(Sender: IKeymanCEFHost);
  public
    constructor Create;
    destructor Destroy; override;
    function Start: Boolean;

    procedure RegisterWindow(cef: IKeymanCEFHost);
    procedure UnregisterWindow(cef: IKeymanCEFHost);
    function StartShutdown(CompletionHandler: TNotifyEvent): Boolean;
  end;

var
  FInitializeCEF: TCEFManager = nil;

implementation

uses
  System.SysUtils,
  Winapi.ShlObj,
  Winapi.Windows,

  KeymanDeveloperUtils,
  KeymanVersion,
  RedistFiles,
  RegistryKeys,
  UTikeDebugMode;

{ TInitializeCEF }

procedure TCEFManager.CompletionHandler(Sender: IKeymanCEFHost);
begin
//  OutputDebugString(PChar('TCEFManager.CompletionHandler'));
  FWindows.Remove(Sender);
  if FWindows.Count = 0 then
  begin
    Assert(@FShutdownCompletionHandler <> nil);
    FShutdownCompletionHandler(Self);
    FShutdownCompletionHandler := nil;
  end;
end;

constructor TCEFManager.Create;
begin
  FWindows := TList<IKeymanCEFHost>.Create;
  // You *MUST* call GlobalCEFApp.StartMainProcess in a if..then clause
  // with the Application initialization inside the begin..end.
  // Read this https://www.briskbard.com/index.php?lang=en&pageid=cef
  GlobalCEFApp := TCefApplication.Create;

   GlobalCEFApp.CheckCEFFiles := False;

  // We run in debug mode when TIKE debug mode flag is set, so that we can
  // debug the CEF interactions more easily
//  GlobalCEFApp.SingleProcess        := TikeDebugMode;

  // In case you want to use custom directories for the CEF3 binaries, cache, cookies and user data.
  // If you don't set a cache directory the browser will use in-memory cache.
  GlobalCEFApp.FrameworkDirPath     := GetCEFPath;
  GlobalCEFApp.ResourcesDirPath     := GlobalCEFApp.FrameworkDirPath;
  GlobalCEFApp.LocalesDirPath       := GlobalCEFApp.FrameworkDirPath + '\locales';
  GlobalCEFApp.EnableGPU            := True;      // Enable hardware acceleration
  GlobalCEFApp.cache                := GetFolderPath(CSIDL_APPDATA) + SFolderKeymanDeveloper + '\browser\cache';  //TODO: refactor into KeymanPaths.pas
  GlobalCEFApp.cookies              := GetFolderPath(CSIDL_APPDATA) + SFolderKeymanDeveloper + '\browser\cookies';
  GlobalCEFApp.UserDataPath         := GetFolderPath(CSIDL_APPDATA) + SFolderKeymanDeveloper + '\browser\userdata';
  GlobalCEFApp.UserAgent            := 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36 (TIKE/'+SKeymanVersion+')';
end;

destructor TCEFManager.Destroy;
begin
  Assert(FWindows.Count = 0);
  FreeAndNil(FWindows);
  GlobalCEFApp.Free;
  GlobalCEFApp := nil;
  FInitializeCEF := nil;
  inherited Destroy;
end;

procedure TCEFManager.RegisterWindow(cef: IKeymanCEFHost);
begin
  FWindows.Add(cef);
end;

function TCEFManager.Start: Boolean;
begin
  Result := GlobalCEFApp.StartMainProcess;
end;

function TCEFManager.StartShutdown(CompletionHandler: TNotifyEvent): Boolean;
var
  i: Integer;
begin
//  OutputDebugString(PChar('TCEFManager.StartShutdown'));
  if FWindows.Count = 0 then
    Exit(True); // Can shutdown immediately
  FShutdownCompletionHandler := CompletionHandler;
  for i := 0 to FWindows.Count - 1 do
    FWindows[i].StartShutdown(Self.CompletionHandler);
  Result := False; // wait for completion handler
end;

procedure TCEFManager.UnregisterWindow(cef: IKeymanCEFHost);
begin
//  OutputDebugString(PChar('TCEFManager.UnregisterWindow'));
  FWindows.Remove(cef);
end;

end.
