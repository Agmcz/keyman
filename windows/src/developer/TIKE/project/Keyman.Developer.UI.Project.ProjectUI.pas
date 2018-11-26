(*
  Name:             Keyman.Developer.UI.Project.ProjectUI
  Copyright:        Copyright (C) SIL International.
  Documentation:    
  Description:      
  Create Date:      4 May 2015

  Modified Date:    4 May 2015
  Authors:          mcdurdin
  Related Files:    
  Dependencies:     

  Bugs:             
  Todo:             
  Notes:            
  History:          04 May 2015 - mcdurdin - I4687 - V9.0 - Split project UI actions into separate classes
                    
*)
unit Keyman.Developer.UI.Project.ProjectUI;   // I4687

interface

uses
  Keyman.Developer.UI.Project.ProjectFileUI;

function GetGlobalProjectUI: TProjectUI;
function LoadGlobalProjectUI(AFilename: string; ALoadPersistedUntitledProject: Boolean = False): TProjectUI;
procedure FreeGlobalProjectUI;

implementation

uses
  System.SysUtils,

  Keyman.Developer.System.Project.Project;

function GetGlobalProjectUI: TProjectUI;
begin
  Result := FGlobalProject as TProjectUI;
end;

procedure FreeGlobalProjectUI;
begin
  FreeAndNil(FGlobalProject);
end;

function LoadGlobalProjectUI(AFilename: string; ALoadPersistedUntitledProject: Boolean = False): TProjectUI;
begin
  Assert(not Assigned(FGlobalProject));
  Result := TProjectUI.Create(AFilename, ALoadPersistedUntitledProject);   // I4687
  FGlobalProject := Result;
end;

end.
